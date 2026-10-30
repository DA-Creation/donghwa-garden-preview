#!/usr/bin/env python3
"""Check included file hashes and reject obvious credential material."""
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
patterns = [r'ghp_[A-Za-z0-9]{24,}', r'github_pat_[A-Za-z0-9_]{30,}',
            r'\br8_[A-Za-z0-9]{24,}', r'\bsk-[A-Za-z0-9_-]{24,}',
            r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----']


def main():
    mapping = json.loads((ROOT / 'file-map.json').read_text())['files']
    for item in mapping:
        path = ROOT / item['archive_path']
        data = path.read_bytes()
        assert len(data) == item['bytes'], f'Size mismatch: {path}'
        assert hashlib.sha256(data).hexdigest() == item['sha256'], f'Hash mismatch: {path}'
        target = Path(item['restore_path'])
        assert not target.is_absolute() and '..' not in target.parts
    scanned = 0
    for path in ROOT.rglob('*'):
        if not path.is_file():
            continue
        if path.suffix.lower() in {'.png','.jpg','.jpeg','.mp4','.gif','.webp','.avif','.heic','.tif','.tiff','.mov','.webm','.m4v','.avi','.mkv'}:
            raise ValueError(f'Media must stay in local iCloud, outside this text-only archive: {path.relative_to(ROOT)}')
        if path.suffix in {'.zip','.pyc'}:
            continue
        if path.name in {'.env','.tokens.json','.oauth-state.json','sftp.json'}:
            raise ValueError(f'Private local-only file found: {path}')
        text = path.read_text()
        for pattern in patterns:
            if re.search(pattern, text):
                raise ValueError(f'Credential-shaped content detected in {path.relative_to(ROOT)}; value omitted')
        scanned += 1
    counts = {folder.name:len([p for p in folder.iterdir() if p.is_file()]) for folder in ROOT.iterdir() if folder.is_dir() and folder.name != '__pycache__'}
    print(json.dumps({'mapped_restores':len(mapping),'text_files_scanned':scanned,'flat_folder_counts':counts,'result':'pass'}, ensure_ascii=False))


if __name__ == '__main__':
    main()
