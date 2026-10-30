# Donghwa work archive instructions

Start with `CURRENT_STATE.json`, then `README.md`, `evidence/product-state.json`, and the relevant latest QA. This archive records current work; an old filename or historical pass does not override the latest product decision. Use the existing repository `DA-Creation/donghwa-garden-preview`, with this archive under `work-archive`.

User correction: GitHub stores code, prompts and records only. Never upload working images, videos, screenshots or old thumbnail backups to this archive. Keep those files in the local iCloud project and `thumbnail-publish-20261030/local-only-assets`; record only their relative paths and hashes. The previously hosted17MP4s used by live pages remain untouched. Missing local media must not block code restoration.

## Reference and content rules

- Before any design or image change, inspect the actual product reference and the approved live reference. Record the source, observed composition/behavior, and the part to reproduce. Implement from that evidence, then compare the rendered result.
- Preserve existing copy, product facts, fields, and purchase behavior unless the user asks to change them. New marketing copy requires an actual source sentence and source URL or supplied original first; general style advice does not qualify.
- Keep product38 unchanged and do not delete products. Read the current per-product decisions before choosing a thumbnail or hero candidate. F is a comparison candidate with remaining AI tells, not a final photographic approval.
- Use actual MP4 autoplay/muted/loop/playsinline for hero motion. Do not substitute GIF/WebP. Do not describe output frame rate as verified camera capture frame rate.

## Continue work across computers

1. Start from the latest remote history. Inspect local changes before `git pull --ff-only`; preserve and reconcile work when needed. Never force-push or overwrite a newer remote from the stale historical `hosting-repo` checkout.
2. Restore working files outside the repository with `restore.py`. Credentials remain local. Read the latest remote storefront/API state before deployment and preserve unrelated fields and page content.
3. After each completed media or deployment change, collect only code/prompts/records and update `CURRENT_STATE.json`, `CHANGELOG.md`, product state, relevant QA, `file-map.json`, and local-media reference manifests. Keep actual media in iCloud. Include enough source and decisions for another computer to continue; do not duplicate the entire workspace.
4. Run `verify.py`, inspect the intended diff, then commit and push the archive update to the existing repository. Do not claim a commit or deployment succeeded before observing its result.

## Credentials and generation

- Never archive filled `.env`, tokens, OAuth state, SFTP credentials, API keys, cookies, private customer records, raw private API responses, or unrelated desktop captures. Placeholder environment examples and already-public storefront source are allowed.
- Restore, verify, collect, and Git synchronization must not trigger paid generation. Run paid generation only within the user's current authorized task and budget; do not automatically spend the remaining estimated budget.
- Record what was actually checked. Desktop/mobile browser viewport checks do not establish physical iPhone behavior. Reference citations and probe summaries are enough; do not copy competitor media into this repository.

## Shared video prompt

Before planning or generating Donghwa video shots and before editing them, read `VIDEO_GENERATION_COMMON_PROMPT.md`. Fill the actual-product inputs and separate per-shot model prompts from editing transitions. Preserve current product42 heat/liquid constraints. Do not assume camera motion, speed ramps or capture fps from a cut or delivery fps. Update this text when later references or user corrections change the rules.
