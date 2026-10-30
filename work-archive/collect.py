#!/usr/bin/env python3
"""Collect mapped code/prompts/records only. Media remains in local iCloud."""
import argparse
import hashlib
import json
import re
import shutil
from collections import defaultdict
from pathlib import Path
from restore import safe_target
from verify import patterns

ROOT = Path(__file__).resolve().parent


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--workspace', type=Path, required=True)
    parser.add_argument('--dry-run', action='store_true')
    args = parser.parse_args()
    doc = json.loads((ROOT / 'file-map.json').read_text())
    grouped = defaultdict(list)
    for item in doc['files']:
        if Path(item['archive_path']).suffix.lower() in {'.png','.jpg','.jpeg','.mp4','.gif','.webp','.avif','.heic','.tif','.tiff','.mov','.webm','.m4v','.avi','.mkv'}:
            continue
        grouped[item['archive_path']].append(item)
    changed = []
    for archived, entries in grouped.items():
        changes = {}
        present_hashes = set()
        for entry in entries:
            path = safe_target(args.workspace, entry['restore_path'])
            if not path.exists():
                continue
            data = path.read_bytes()
            current = hashlib.sha256(data).hexdigest()
            present_hashes.add(current)
            if current != entry['sha256']:
                changes[current] = (path, data)
        if len(present_hashes) > 1:
            raise ValueError(f'Conflicting edits to aliases for {archived}; resolve manually')
        if not changes:
            continue
        current, (path, data) = next(iter(changes.items()))
        if path.suffix not in {'.png','.jpg','.jpeg','.mp4','.gif','.webp'}:
            value = data.decode()
            if any(re.search(pattern, value) for pattern in patterns):
                raise ValueError(f'Credential-shaped content in {path.name}; not copied')
        changed.append(archived)
        if not args.dry_run:
            shutil.copyfile(path, safe_target(ROOT, archived))
            for entry in entries:
                entry['sha256'] = current
                entry['bytes'] = len(data)
    if not args.dry_run:
        (ROOT / 'file-map.json').write_text(json.dumps(doc, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'dry_run':args.dry_run,'changed_files':changed}, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
