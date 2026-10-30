#!/usr/bin/env python3
"""Restore the flattened, versioned archive without credentials or network writes."""
import argparse
import hashlib
import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def safe_target(root, relative):
    rel = Path(relative)
    if rel.is_absolute() or '..' in rel.parts:
        raise ValueError(f'Unsafe restore path: {relative}')
    result = (root / rel).resolve()
    result.relative_to(root.resolve())
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--local-media', type=Path, help='Optional local iCloud media folder; missing files are skipped. No network downloads.')
    parser.add_argument('--overwrite', action='store_true', help='Explicitly replace differing existing files.')
    parser.add_argument('--text-only', action='store_true', help='Restore source/prompts/evidence but skip included binary assets.')
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    copied = 0
    entries = json.loads((ROOT / 'file-map.json').read_text())['files']
    for entry in entries:
        if args.text_only and entry['archive_path'].startswith('assets/'):
            continue
        source = safe_target(ROOT, entry['archive_path'])
        if digest(source) != entry['sha256']:
            raise ValueError(f'Archive hash mismatch: {entry["archive_path"]}')
        dest = safe_target(args.output, entry['restore_path'])
        if dest.exists() and digest(dest) != entry['sha256'] and not args.overwrite:
            raise ValueError(f'Existing file differs; use another output folder: {dest}')
        dest.parent.mkdir(parents=True, exist_ok=True)
        if not dest.exists() or digest(dest) != entry['sha256']:
            shutil.copyfile(source, dest)
        copied += 1
    media_copied = 0
    media_missing = 0
    if args.local_media and not args.text_only:
        manifest = json.loads((ROOT / 'thumbnail-assets-map.json').read_text())
        for item in manifest.get('assets', []):
            source = safe_target(args.local_media, item['local_file'])
            if not source.is_file() or digest(source) != item['sha256']:
                media_missing += 1
                continue
            for relative in item['restore_paths']:
                dest = safe_target(args.output, relative)
                if dest.exists() and digest(dest) != item['sha256'] and not args.overwrite:
                    continue
                dest.parent.mkdir(parents=True, exist_ok=True)
                if not dest.exists() or digest(dest) != item['sha256']:
                    shutil.copyfile(source, dest)
                media_copied += 1
    print(f'Restored {copied} text files; copied {media_copied} local media aliases; skipped {media_missing} missing/different media files into {args.output.resolve()}')



if __name__ == '__main__':
    main()
