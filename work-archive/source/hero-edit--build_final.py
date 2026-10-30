from pathlib import Path
import subprocess, json, hashlib, shutil

N = Path(__file__).resolve().parent
P = N.parent / 'jjamppong-hero-multicut-20261029'
clips = [
    (N / 'outputs/shot01-place-v5.mp4', 35, 69, 'New small contact placement; exclude late droplet f75'),
    (P / 'outputs/42-E-hero-multicut-v4.mp4', 34, 97, 'Keep previous gentle submerged stir; new v5 shot02 rejected for heaped lift'),
    (N / 'outputs/shot03-lift-v5.mp4', 14, 58, 'New contact-to-low-lift; small solid leaf releases naturally, no liquid drop'),
]
filters = []
for i, (_, start, end, _) in enumerate(clips):
    filters.append(f'[{i}:v]trim=start_frame={start}:end_frame={end},setpts=PTS-STARTPTS,setsar=1[v{i}]')
filters.append('[v0][v1][v2]concat=n=3:v=1:a=0,setpts=PTS*1001/1000[out]')
out = N / 'outputs/42-F-hero-multicut-v5.mp4'
cmd = ['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y']
for path, _, _, _ in clips: cmd += ['-i', str(path)]
cmd += ['-filter_complex', ';'.join(filters), '-map', '[out]', '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', '24000/1001', '-movflags', '+faststart', str(out)]
subprocess.run(cmd, check=True)
probe = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', str(out)]))
v = probe['streams'][0]
assert len(probe['streams']) == 1 and v['codec_type'] == 'video'
assert v['width'] == 1280 and v['height'] == 720 and v['nb_frames'] == '141' and v['avg_frame_rate'] == '24000/1001'
poster = N / 'deploy/staged/skin5/product-full/hero-review-20261029/media/42-F-poster.jpg'
poster.parent.mkdir(parents=True, exist_ok=True)
subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(out),'-frames:v','1','-q:v','2','-update','1',str(poster)],check=True)
hosting_media = N / 'hosting-repo/media/hero-review-20261029'
hosting_media.mkdir(parents=True, exist_ok=True)
shutil.copy2(out, hosting_media / out.name)
record = {'output': str(out), 'sha256': hashlib.sha256(out.read_bytes()).hexdigest(), 'bytes': out.stat().st_size, 'frames': 141, 'fps': '24000/1001', 'duration_seconds': 141*1001/24000, 'cuts_at_frames': [34,97], 'motion_interpolation': False, 'retime': '0.1% longer timestamps to conform 24fps sources to Cookat delivery 23.976fps', 'audio': False, 'clips': [{'source':str(p),'start_inclusive':s,'end_exclusive':e,'reason':r} for p,s,e,r in clips], 'quality': 'Comparison candidate: improved contact actions; microtexture and some planar tofu faces still look generated. Not certified photographic.', 'probe':probe}
(N / 'qa').mkdir(parents=True, exist_ok=True)
(N / 'qa/final-edit.json').write_text(json.dumps(record,ensure_ascii=False,indent=2))
print(json.dumps({k:record[k] for k in ['output','sha256','bytes','frames','fps','duration_seconds']},ensure_ascii=False,indent=2))
