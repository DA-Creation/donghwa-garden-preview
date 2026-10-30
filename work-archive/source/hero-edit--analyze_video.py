"""Local, repeatable video QA. No API calls and no modification of the input.

Run with bundled Python/Pillow:
  python analyze_video.py INPUT.mp4 OUTPUT_QA_DIRECTORY

The first ffmpeg pass decodes every video frame, logs original showinfo PTS,
and saves a 640px-wide JPEG for each frame. A separate pass records scene-score
candidates. Pillow creates an overview and 36-frame sheets for human review.
"""
from __future__ import annotations

import argparse
import bisect
import csv
import hashlib
import json
import math
import re
import subprocess
import shutil
import sys
from fractions import Fraction
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps

DEFAULT_FFMPEG = shutil.which('ffmpeg') or 'ffmpeg'
FRAME_RE = re.compile(r'\bn:\s*(\d+)\s+pts:\s*(-?\d+)\s+pts_time:\s*([^\s]+).*?\bs:(\d+)x(\d+)')
RATE_RE = re.compile(r'config in time_base:\s*(\d+/\d+),\s*frame_rate:\s*(\d+/\d+)')


def sha256(path):
    digest = hashlib.sha256()
    with path.open('rb') as source:
        while chunk := source.read(1024 * 1024):
            digest.update(chunk)
    return digest.hexdigest()


def dump(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


def run_log(command, log, timeout):
    with log.open('wb') as stream:
        try:
            completed = subprocess.run(command, stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL,
                                       stderr=stream, timeout=timeout)
            return {'exit_code': completed.returncode, 'timed_out': False}
        except subprocess.TimeoutExpired:
            return {'exit_code': None, 'timed_out': True}


def parse_showinfo(text):
    rate_match = RATE_RE.search(text)
    time_base = Fraction(rate_match.group(1)) if rate_match else None
    frame_rate = Fraction(rate_match.group(2)) if rate_match and rate_match.group(2) != '0/0' else None
    frames = []
    for line in text.splitlines():
        match = FRAME_RE.search(line)
        if not match:
            continue
        index, pts, shown_time, width, height = match.groups()
        exact = int(pts) * time_base if time_base is not None else Fraction(shown_time)
        duration_match = re.search(r'\bduration:\s*(-?\d+)\s+duration_time:\s*([^\s]+)', line)
        duration_ticks = int(duration_match.group(1)) if duration_match else None
        duration = duration_ticks * time_base if duration_ticks is not None and time_base is not None else None
        frames.append({'frame_index': int(index), 'pts': int(pts), 'pts_seconds': float(exact),
                       'pts_exact': str(exact), 'showinfo_pts_time': shown_time,
                       'duration_ticks': duration_ticks,
                       'duration_seconds': float(duration) if duration is not None else None,
                       'width': int(width), 'height': int(height),
                       'keyframe': bool(re.search(r'iskey:1\b', line)),
                       'picture_type': (re.search(r'\btype:([A-Z?])', line).group(1)
                                        if re.search(r'\btype:([A-Z?])', line) else None)})
    return frames, time_base, frame_rate


def font(size):
    for path in ('/System/Library/Fonts/Menlo.ttc', '/System/Library/Fonts/Helvetica.ttc'):
        try:
            return ImageFont.truetype(path, size=size)
        except OSError:
            pass
    return ImageFont.load_default(size=size)


def contact_sheet(items, frames_dir, destination, title, columns, rows, cell_width, aspect):
    image_height = round(cell_width / aspect)
    label_height, header_height = 30, 38
    cell_height = image_height + label_height
    sheet = Image.new('RGB', (columns * cell_width, header_height + rows * cell_height), '#f3f3f3')
    draw = ImageDraw.Draw(sheet)
    draw.text((10, 9), title, fill='#111111', font=font(17))
    label_font = font(13)
    for slot, item in enumerate(items):
        column, row = slot % columns, slot // columns
        x, y = column * cell_width, header_height + row * cell_height
        with Image.open(frames_dir / item['jpeg']) as original:
            thumb = ImageOps.contain(original.convert('RGB'), (cell_width, image_height), Image.Resampling.LANCZOS)
        draw.rectangle((x, y, x + cell_width - 1, y + image_height - 1), fill='#111111')
        sheet.paste(thumb, (x + (cell_width - thumb.width) // 2, y + (image_height - thumb.height) // 2))
        label = f"f{item['frame_index']:06d}  {item['pts_seconds']:.6f}s"
        draw.text((x + 5, y + image_height + 6), label, fill='#111111', font=label_font)
    sheet.save(destination, quality=93, subsampling=0)


def analyze(args):
    source = args.input.expanduser().resolve()
    output = args.output.expanduser().resolve()
    ffmpeg = Path(args.ffmpeg).expanduser().resolve()
    if not source.is_file() or not ffmpeg.is_file():
        raise ValueError('Input video or ffmpeg binary is missing')
    if getattr(source.stat(), 'st_flags', 0) & 0x40000000:
        raise ValueError('Input video is an iCloud placeholder; this helper will not request downloads')
    if output.exists() and any(output.iterdir()):
        raise ValueError('QA output directory must be empty to prevent mixing different attempts')
    if not (0 < args.scene_threshold < 1) or args.overview_fps <= 0:
        raise ValueError('Use a scene threshold between 0 and 1 and a positive overview frame rate')
    output.mkdir(parents=True, exist_ok=True)
    frames_dir, sheets_dir = output / 'frames-640', output / 'every-frame-sheets'
    frames_dir.mkdir()
    sheets_dir.mkdir()
    original_hash, original_bytes = sha256(source), source.stat().st_size
    version = subprocess.check_output([str(ffmpeg), '-version'], text=True).splitlines()[0]
    # showinfo is before scale: dimensions and timestamp ticks describe decoded source frames.
    decode_command = [str(ffmpeg), '-hide_banner', '-nostdin', '-loglevel', 'info', '-err_detect', 'explode',
                      '-i', str(source), '-map', '0:v:0', '-an',
                      '-vf', 'showinfo,scale=640:-2', '-fps_mode', 'passthrough', '-q:v', '2',
                      '-start_number', '0', str(frames_dir / 'frame-%06d.jpg')]
    decode = run_log(decode_command, output / 'full-decode-showinfo.log', args.timeout)
    log = (output / 'full-decode-showinfo.log').read_text(errors='replace')
    frames, time_base, frame_rate = parse_showinfo(log)
    for frame in frames:
        frame['jpeg'] = f"frame-{frame['frame_index']:06d}.jpg"
    input_section = log.split('Stream mapping:', 1)[0]
    streams = [line.strip() for line in input_section.splitlines() if re.search(r'^\s*Stream #\d+:\d+', line)]
    audio_streams = [line for line in streams if ': Audio:' in line]
    container_match = re.search(r'Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)', input_section)
    container_duration = (int(container_match[1]) * 3600 + int(container_match[2]) * 60 + float(container_match[3])) if container_match else None
    jpeg_files = sorted(frames_dir.glob('frame-*.jpg'))
    decode_errors = [line.strip() for line in log.splitlines() if re.search(
        r'error while decoding|error submitting|invalid data found|corrupt decoded frame|conversion failed|error opening|decode_slice_header error|missing picture|failed to decode', line, re.I)]
    metadata = {'input': str(source), 'input_bytes': original_bytes, 'input_sha256': original_hash,
                'ffmpeg_version': version, 'full_decode': decode, 'decoded_frame_count': len(frames),
                'saved_jpeg_count': len(jpeg_files), 'time_base': str(time_base) if time_base is not None else None,
                'frame_rate_rational': str(frame_rate) if frame_rate is not None else None,
                'fps_nominal': float(frame_rate) if frame_rate is not None else None,
                'container_duration_seconds_rounded': container_duration,
                'audio_present': bool(audio_streams), 'audio_stream_count': len(audio_streams),
                'input_streams': streams, 'decode_error_lines': decode_errors,
                'full_decode_command': decode_command,
                'scene_threshold': args.scene_threshold,
                'note': 'Scene-score candidates indicate visual change, not automatically editorial cuts. Exact original timestamps are in frames.json/csv. The JPEGs are scaled review copies; inspect native-resolution critical frames separately for fine texture.'}
    decode_ok = decode['exit_code'] == 0 and not decode['timed_out'] and not decode_errors and len(frames) == len(jpeg_files) and len(frames) > 0
    metadata['full_decode_success'] = decode_ok
    dump(output / 'frames.json', frames)
    if frames:
        with (output / 'frames.csv').open('w', newline='') as out:
            writer = csv.DictWriter(out, fieldnames=list(frames[0]))
            writer.writeheader()
            writer.writerows(frames)
    if not frames or len(frames) != len(jpeg_files):
        metadata['input_unchanged'] = sha256(source) == original_hash
        dump(output / 'metadata.json', metadata)
        raise ValueError('Full decode did not produce one JPEG per timestamped frame; inspect the saved log')
    exact_pts = [Fraction(frame['pts_exact']) for frame in frames]
    intervals = [b - a for a, b in zip(exact_pts, exact_pts[1:])]
    last = frames[-1]
    last_duration = (last['duration_ticks'] * time_base
                     if last['duration_ticks'] is not None and time_base is not None and last['duration_ticks'] > 0
                     else intervals[-1] if intervals else Fraction(1, 1) / frame_rate if frame_rate else Fraction(0))
    duration = exact_pts[-1] + last_duration - exact_pts[0]
    dimensions = sorted({(frame['width'], frame['height']) for frame in frames})
    metadata.update(width=frames[0]['width'], height=frames[0]['height'], dimensions=dimensions,
                    video_duration_seconds=float(duration), video_duration_exact=str(duration),
                    first_pts_seconds=float(exact_pts[0]), last_pts_seconds=float(exact_pts[-1]),
                    fps_measured=((len(frames) - 1) / float(exact_pts[-1] - exact_pts[0]) if len(frames) > 1 and exact_pts[-1] != exact_pts[0] else None),
                    monotonic_pts=all(delta > 0 for delta in intervals),
                    variable_frame_intervals=len(set(intervals)) > 1,
                    min_frame_interval_seconds=float(min(intervals)) if intervals else None,
                    max_frame_interval_seconds=float(max(intervals)) if intervals else None)
    aspect = frames[0]['width'] / frames[0]['height']
    sheet_files = []
    for start in range(0, len(frames), 36):
        batch = frames[start:start + 36]
        name = f"frames-{start:06d}-{start + len(batch) - 1:06d}.jpg"
        contact_sheet(batch, frames_dir, sheets_dir / name,
                      f"Every decoded frame | {start}-{start + len(batch) - 1} | original frame PTS", 6, 6, 256, aspect)
        sheet_files.append('every-frame-sheets/' + name)
    selection = []
    sample_count = math.ceil(duration * args.overview_fps)
    for sample in range(sample_count):
        target = exact_pts[0] + Fraction(sample, args.overview_fps)
        insertion = bisect.bisect_left(exact_pts, target)
        candidates = [index for index in (insertion - 1, insertion) if 0 <= index < len(frames)]
        index = min(candidates, key=lambda i: (abs(exact_pts[i] - target), i))
        selected = dict(frames[index], overview_sample_index=sample, target_seconds=float(target))
        selection.append(selected)
    overview_name = f'overview-{args.overview_fps}fps-480wide.jpg'
    contact_sheet(selection, frames_dir, output / overview_name,
                  f"{args.overview_fps} fps overview | nearest decoded frame + exact source PTS", 4,
                  max(1, math.ceil(len(selection) / 4)), 480, aspect)
    dump(output / 'overview-selection.json', selection)
    scene_filter = f"select='gt(scene,{args.scene_threshold})',showinfo,metadata=print:key=lavfi.scene_score"
    scene_command = [str(ffmpeg), '-hide_banner', '-nostdin', '-loglevel', 'info', '-i', str(source),
                     '-map', '0:v:0', '-vf', scene_filter, '-an', '-fps_mode', 'passthrough', '-f', 'null', '-']
    scene_result = run_log(scene_command, output / 'scene-detection.log', args.timeout)
    scene_log = (output / 'scene-detection.log').read_text(errors='replace')
    candidates, _, _ = parse_showinfo(scene_log)
    scores = [float(value) for value in re.findall(r'lavfi\.scene_score=([0-9.eE+-]+)', scene_log)]
    frame_lookup = {value: index for index, value in enumerate(exact_pts)}
    for index, item in enumerate(candidates):
        item['scene_candidate_index'] = item.pop('frame_index')
        item['source_frame_index'] = frame_lookup.get(Fraction(item['pts_exact']))
        item['scene_score'] = scores[index] if len(scores) == len(candidates) else None
    dump(output / 'scene-candidates.json', candidates)
    metadata.update(scene_detection=scene_result, scene_detection_command=scene_command,
                    scene_candidates_count=len(candidates), scene_candidate_pts_seconds=[item['pts_seconds'] for item in candidates],
                    every_frame_sheets=sheet_files, overview_samples=len(selection),
                    overview=overview_name, input_unchanged=sha256(source) == original_hash)
    dump(output / 'metadata.json', metadata)
    print(json.dumps({'qa_directory': str(output), 'full_decode_success': decode_ok,
                      'width': metadata['width'], 'height': metadata['height'], 'fps': metadata['fps_nominal'],
                      'frames': len(frames), 'duration': metadata['video_duration_seconds'],
                      'audio_present': metadata['audio_present'], 'scene_pts': metadata['scene_candidate_pts_seconds'],
                      'every_frame_sheets': len(sheet_files), 'input_unchanged': metadata['input_unchanged']}))
    return 0 if decode_ok and scene_result['exit_code'] == 0 and metadata['input_unchanged'] else 1


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('input', type=Path)
    parser.add_argument('output', type=Path)
    parser.add_argument('--ffmpeg', default=DEFAULT_FFMPEG)
    parser.add_argument('--scene-threshold', type=float, default=0.15)
    parser.add_argument('--overview-fps', type=int, default=4)
    parser.add_argument('--timeout', type=int, default=300)
    return analyze(parser.parse_args())


if __name__ == '__main__':
    try:
        raise SystemExit(main())
    except (ValueError, OSError, subprocess.SubprocessError) as exc:
        print(json.dumps({'error': type(exc).__name__, 'message': str(exc)}), file=sys.stderr)
        raise SystemExit(1)
