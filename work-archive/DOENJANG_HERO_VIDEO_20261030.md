# Product 32 - Doenjang hero video text archive draft

Record date: 2026-10-30 (Asia/Seoul).

Status: seven source videos generated and the 6.740067-second four-shot review draft is rendered. All edit selections and the estimated total USD4.82 are recorded below. Final native D review is complete: frames35-76 pass as a review draft, with residual gloss and pronounced suspended particles. No storefront deployment. Text-only archive prepared for the current GitHub commit.

This snapshot preserves actual prompt text, selected generation settings, failure decisions and local media paths. API success is separate from visual approval. Existing DOENJANG_HERO_4CUTS_20261030.md remains unchanged as the earlier still-image work record; its historical video-not-generated state does not describe this subsequent video work.

## Reference and observed frame rates

- Product: Donghwa Garden beef and cooked napa-cabbage doenjang stew, Cafe24 product_no 32.
- Actual food references: thumbnail-generation-20261028/evidence/source-images/32-original-detail-1.jpg and 32-original-detail-2.jpg.
- Motion reference: https://cookatmarket.com/ko/product/detail?product_id=2094
- Reference hero MP4: https://crcf.cookatmarket.com/video/product_detail/2024/07/cofu_1721284012_9574/MP4/cofu_1721284012_9574.mp4
- Four shots: local pot simmer, ladle movement, wide serving transfer, closer broth finish. All connections are zero-frame hard cuts; D-to-A is a direct loop jump, not a seamless continuous take.
- Cookat delivery file: 1280x720, 30000/1001 fps (about 29.97), 209 frames, 6.973633 seconds.
- Our decoded Seedance sources: 1280x720, 24 fps, 97 frames each, 97/24 seconds (about 4.041667). Requested/API duration is 4 seconds per call. Distinguish requested/billing duration from decoded duration.
- Capture at 120fps or a slow-motion multiplier is unknown. No optical-flow interpolation, speed ramp or assumed capture rate is justified by delivery fps alone.
- Sources: prompts/EDIT_PLAN.md, prompts/SHOT_INPUTS.json and qa/*/metadata.json. This archive worker read existing records; it did not perform a new visual media review.

## Generation settings

| Setting | Recorded value |
|---|---|
| Models | bytedance/seedance-2.0 (6 calls); wan-video/wan-2.5-i2v (1 comparison call) |
| Requested duration | Seedance: 4 seconds each; Wan2.5: 5 seconds |
| Resolution / aspect | 720p / 16:9 |
| Audio | Seedance generate_audio:false; Wan source audio removed from the final silent edit |
| Calls | Seedance A/B/C/D-v1, B-v2, D-v2 plus Wan D-v3: 7 total; no further calls planned |
| Price references | https://replicate.com/bytedance/seedance-2.0#pricing ; https://replicate.com/wan-video/wan-2.5-i2v |
| Estimated unit prices | Seedance USD0.18/s; Wan2.5 USD0.10/s (parent current-price verification) |
| Final generation cost estimate | Seedance6 x4s xUSD0.18 + Wan1 x5s xUSD0.10 = USD4.82 |

Final generation total is7calls with an estimated USD4.82. This is a duration-based estimate, not a verified account invoice. No account balance, billing account details, credentials, prediction IDs, temporary output URLs, binary input or base64 is archived.

## Start-image mapping

| Shot | Project-relative input |
|---|---|
| A | `doenjang-hero-4cuts-20261030/images/A-pot-v1.png` |
| B | `doenjang-hero-4cuts-20261030/images/B-ladle-v1.png` |
| C | `doenjang-hero-4cuts-20261030/images/C-serve-wide-v1.png` |
| D | `doenjang-hero-4cuts-20261030/images/D-serve-close-v3.png` |

B-v2 reuses B's input; both D-v2 and Wan D-v3 reuse the selected D-v3 still input. The video version D-v3 and still-image version D-v3 are separate files. The off-white bowl and utensils are serving props, not package contents. Preserve actual food identity and the visible portion rather than implying the entire pot equals one retail pouch.

## Generated sources and local storage

All media stays in the local iCloud project. These are path/metadata references only; media has not been copied into this text archive.

| Local project-relative file | State | Decoded metadata |
|---|---|---|
| `doenjang-hero-video-20261030/raw/A-v1.mp4` | Generated; A [8,48) confirmed by parent | 1280x720, 24fps, 97 frames, 97/24 sec, silent |
| `doenjang-hero-video-20261030/raw/B-v1.mp4` | Rejected: draining/drips and excessive lift | 1280x720, 24fps, 97 frames, 97/24 sec, silent |
| `doenjang-hero-video-20261030/raw/C-v1.mp4` | Generated; C [56,92) confirmed by parent | 1280x720, 24fps, 97 frames, 97/24 sec, silent |
| `doenjang-hero-video-20261030/raw/D-v1.mp4` | Rejected by parent: smooth thick triangular liquid membrane | 1280x720, 24fps, 97 frames, 97/24 sec, silent |
| `doenjang-hero-video-20261030/raw/B-v2.mp4` | Generated; final [40,84), low stable serving; excludes initial protrusion | 1280x720, 24fps, 97 frames, 97/24 sec, silent |
| `doenjang-hero-video-20261030/raw/D-v2.mp4` | Generated, rejected by parent: same sauce-like triangular flow | See qa/D-v2/metadata.json |
| `doenjang-hero-video-20261030/raw/D-v3-wan.mp4` | Generated; selected [35,77), native D review complete; conditional draft pass | 1280x720,24fps,121frames,121/24sec, audio present in source and removed in final edit |

QA frame sheets, stills and extracted frames remain under doenjang-hero-video-20261030/qa/. Start images remain under doenjang-hero-4cuts-20261030/images/. The rendered draft is `doenjang-hero-video-20261030/outputs/32-doenjang-hero-v1.mp4`; the exact file hash and render manifest are below.

## Failure history and prompt changes

### B-v1 rejected

Source: qa/AB-decision.json. Frame numbering is zero-based.

- f20/24/42: brown liquid connects the ladle underside to the pot and creates concentric impact rings, violating B's no-drain/no-pour condition.
- f60/90: hanging and detached drops recur.
- From f24: lift and reframing are excessive; the pot drops out of the frame and background dominates.
- From f18: wet cabbage hangs outside the ladle rather than staying supported inside.
- The conservative clean lead-in [0,16) is only 0.667 seconds, not a valid 1.5-2 second continuous shot. Do not pad, slow, reverse or splice isolated clean instants to imply a successful take.

B-v2 changes to a 5mm initial adjustment within 0.8 seconds followed by a low hold, with locked framing and the underside below the nearby rim. Food and liquid remain contained. Parent confirms [40,84), 44 source frames: exclude the early protrusion and retain the low, stable supported serving. The earlier [8,52) candidate is superseded.

### D-v1 rejected

Source: parent's final visual decision communicated to this archive task. The pour becomes a smooth, thick, sauce-like triangular membrane, inconsistent with ordinary low-viscosity soup. D-v1 is excluded from the final edit.

D-v2 explicitly requests cloudy but mobile, low-viscosity soup, a ladle lip only 2-3cm above the food, a short irregular changing flow, no persistent triangular membrane and a stop before a final isolated drip. It generated successfully but was also rejected by the parent: the sauce-like smooth triangular flow persisted without sufficient soup-physics improvement.

### D-v3 Wan2.5 comparison

One additional call uses wan-video/wan-2.5-i2v,720p,5seconds,enable_prompt_expansion:false,seed2026103235. The JSON prompt below includes a separate negative_prompt. Unit price is USD0.10/s according to the parent's current official-model-page check. Generation succeeded. Selected source interval is [35,77),42frames at24fps; native D review complete; conditional draft pass. No further generation calls are planned.

## Review-draft edit record

| Shot | Source | Source frames [in,out) | Count | State |
|---|---|---|---|---|
| A | A-v1 | [8,48) | 40 | Confirmed by parent |
| B | B-v2 | [40,84) | 44 | Confirmed by parent; early protrusion excluded |
| C | C-v1 | [56,92) | 36 | Confirmed by parent |
| D | Wan D-v3 | [35,77) | 42 | Selected by parent; native D review complete; conditional draft pass |

All selected source frame references use24fps. The rendered draft is202frames at30000/1001fps,6.740067seconds,1280x720,silent. Native motion speed is1x, with no optical-flow interpolation or slow-motion. The ffmpeg fps filter changes output cadence by frame duplication/drop, not capture rate or motion speed. Hard-cut boundaries are1.668333,3.5035 and5.005seconds. D-to-A is a direct loop jump. The previous approximately6.8-7second target is superseded by this observed render duration.

## Current prompt source snapshot

Seven current prompt files are preserved below. B-v1,D-v1,D-v2 are rejected versions. A current-source hash supersedes the stale hash in the initial planning record; this document preserves current source text, not a reconstructed raw API request.

### A-pot-video.txt

Source:`doenjang-hero-video-20261030/prompts/A-pot-video.txt`

```text
Create one continuous landscape food video shot from the supplied start image. Preserve the actual Donghwa Garden beef and cooked napa-cabbage doenjang stew: the same soft olive-brown cabbage leaves and long ribs, irregular gray-brown cooked beef pieces, existing pale-green and white scallion pieces, and opaque brown broth with fine suspended seasoning. Keep the exact visible portion, cookware, serving bowl if present, wooden table, warm side light, natural focus, and restrained wet reflections. This is cooked cabbage and beef, not a generic tofu stew. Preserve the original food detail; do not sharpen meat into repeated beads or tiny ridges.

START: Keep the supplied elevated oblique view of the full black shallow pot with its two loop handles. The food is already cooked and the surface already contains irregular foam.
ACTION: Let only a few small, separated patches of existing broth gently simmer. Small bubbles appear and collapse at different moments near existing open broth areas; neighboring liquid shifts slightly while the cabbage, beef, and central scallion placement remain substantially stable. Preserve the uneven existing foam rather than making every bubble expand together. Maintain this calm state throughout, without building toward a rolling boil.
CAMERA: Locked framing at the supplied angle and distance. No pan, push-in, zoom, or rising camera.
HEAT STATE: Gentle local simmer supported by the real product photograph.
LIQUID ACTION: None. No ladle, lifting, pouring, or falling liquid in this shot.

Keep ingredients identifiable and conserve the total quantity throughout the shot. Soft cooked leaves may bend and settle naturally, without morphing into new ingredients. No ingredient duplication, texture crawling, unsupported floating food, transparent amber broth, uniform plastic gloss, or unexplained background movement. Do not add tofu, zucchini, mushrooms, noodles, eggs, new garnish, visible hands, or new table props. No decorative droplets, hanging drops, thin syrup-like liquid threads, splashes, or geometric ripple rings. Do not add steam, vapor, haze, or a dramatic boil.

One uninterrupted shot only: no internal edit, dissolve, wipe, flash, speed ramp, transition zoom, or montage. Ordinary controlled serving speed, not exaggerated slow motion. Landscape 16:9, 1280x720, silent, no text or graphics. Keep sufficient clean motion for a 1.5-2 second excerpt from the 4-5 second source clip. Any outgoing hard cut is added later in editing; do not generate it inside this clip.
```

### B-ladle-video.txt

Source:`doenjang-hero-video-20261030/prompts/B-ladle-video.txt`

```text
Create one continuous landscape food video shot from the supplied start image. Preserve the actual Donghwa Garden beef and cooked napa-cabbage doenjang stew: the same soft olive-brown cabbage leaves and long ribs, irregular gray-brown cooked beef pieces, existing pale-green and white scallion pieces, and opaque brown broth with fine suspended seasoning. Keep the exact visible portion, cookware, serving bowl if present, wooden table, warm side light, natural focus, and restrained wet reflections. This is cooked cabbage and beef, not a generic tofu stew. Preserve the original food detail; do not sharpen meat into repeated beads or tiny ridges.

START: The existing metal ladle supports its current small serving immediately above the brown broth, close to the pot surface. Keep the same cabbage, beef pieces, and scallion on the ladle.
ACTION: Lift that same supported serving only a few centimeters in one short, controlled upward movement. Most of the rise happens early; smoothly reduce the movement and settle into a brief stable low hold. Keep the cabbage resting inside the ladle instead of stretching or dangling from it. Do not tip the ladle or empty it. A small local displacement at the initial food-surface contact is acceptable; liquid must not drain from the raised ladle.
CAMERA: Follow the ladle upward with only a small coherent reframing, enough to keep the serving readable. The pot rim and background shift slightly downward together. Do not enlarge the food, orbit, roll, or zoom through the ladle. The camera settles when the ladle settles.
HEAT STATE: Preserve only subtle, uneven simmer in the pot already present in the start image; no new heat effects on the lifted food.
LIQUID ACTION: None. No pour, drips, detached liquid, or thin liquid connection between ladle and pot.

Keep ingredients identifiable and conserve the total quantity throughout the shot. Soft cooked leaves may bend and settle naturally, without morphing into new ingredients. Keep the metal utensil rigid and its handle coherently connected beyond the frame. No ingredient duplication, texture crawling, unsupported floating food, transparent amber broth, uniform plastic gloss, or unexplained background movement. Do not add tofu, zucchini, mushrooms, noodles, eggs, new garnish, visible hands, or new table props. No decorative droplets, hanging drops, thin syrup-like liquid threads, splashes, or geometric ripple rings. Do not add steam, vapor, haze, or a dramatic boil.

One uninterrupted shot only: no internal edit, dissolve, wipe, flash, speed ramp, transition zoom, or montage. Ordinary controlled serving speed, not exaggerated slow motion. Landscape 16:9, 1280x720, silent, no text or graphics. Keep sufficient clean motion for a 1.5-2 second excerpt from the 4-5 second source clip. Any outgoing hard cut is added later in editing; do not generate it inside this clip.
```

### C-serve-wide-video.txt

Source:`doenjang-hero-video-20261030/prompts/C-serve-wide-video.txt`

```text
Create one continuous landscape food video shot from the supplied start image. Preserve the actual Donghwa Garden beef and cooked napa-cabbage doenjang stew: the same soft olive-brown cabbage leaves and long ribs, irregular gray-brown cooked beef pieces, existing pale-green and white scallion pieces, and opaque brown broth with fine suspended seasoning. Keep the exact visible portion, cookware, serving bowl if present, wooden table, warm side light, natural focus, and restrained wet reflections. This is cooked cabbage and beef, not a generic tofu stew. Preserve the original food detail; do not sharpen meat into repeated beads or tiny ridges.

START: The loaded metal ladle is above the inside of the empty small off-white serving bowl. The same black pot remains behind it. This bowl is a serving prop, not product packaging.
ACTION: Make one ordinary short serving transfer. Bring the ladle slightly closer to the inside of the receiving bowl, then rotate it once toward the bowl center. A brief broad, coherent flow of the existing brown broth goes first, followed by the same beef pieces and soft cabbage sliding together under gravity. They land close to the bowl bottom and settle into a modest serving. The ladle loses exactly what the bowl receives. Keep the quantity limited to this one ladleful; the bowl must not suddenly become full. Finish the single transfer without a second scoop or repeated tipping.
CAMERA: Locked wide oblique composition showing the receiving bowl, ladle, and background pot throughout. No camera move or zoom.
HEAT STATE: The serving is off the heat. Preserve the background pot's appearance with only its already established subtle simmer; no steam or new foam in the white bowl.
AUTHORIZED LIQUID ACTION: One short pour with both broth and the solids already supported by this ladle. The flow is physically connected during the transfer, broad and ordinary rather than a thin syrup string. No decorative breakup into individual droplets.

Keep ingredients identifiable and conserve the total quantity throughout the shot. Soft cooked leaves may bend and settle naturally, without morphing into new ingredients. Keep the metal utensil rigid and its handle coherently connected beyond the frame. No ingredient duplication, texture crawling, unsupported floating food, transparent amber broth, uniform plastic gloss, or unexplained background movement. Do not add tofu, zucchini, mushrooms, noodles, eggs, new garnish, visible hands, or new table props. No decorative droplets, hanging drops, thin syrup-like liquid threads, splashes, or geometric ripple rings. Do not add steam, vapor, haze, or a dramatic boil.

One uninterrupted shot only: no internal edit, dissolve, wipe, flash, speed ramp, transition zoom, or montage. Ordinary controlled serving speed, not exaggerated slow motion. Landscape 16:9, 1280x720, silent, no text or graphics. Keep sufficient clean motion for a 1.5-2 second excerpt from the 4-5 second source clip. Any outgoing hard cut is added later in editing; do not generate it inside this clip.
```

### D-serve-close-video.txt

Source:`doenjang-hero-video-20261030/prompts/D-serve-close-video.txt`

```text
Create one continuous landscape food video shot from the supplied start image. Preserve the actual Donghwa Garden beef and cooked napa-cabbage doenjang stew: the same soft olive-brown cabbage leaves and long ribs, irregular gray-brown cooked beef pieces, existing pale-green and white scallion pieces, and opaque brown broth with fine suspended seasoning. Keep the exact visible portion, cookware, serving bowl if present, wooden table, warm side light, natural focus, and restrained wet reflections. This is cooked cabbage and beef, not a generic tofu stew. Preserve the original food detail; do not sharpen meat into repeated beads or tiny ridges.

START: The same off-white bowl already holds the modest serving shown in this image: its existing cooked cabbage, long rib, two visible beef pieces, scallion, and some opaque brown broth. The same metal ladle contains broth only, above the inside of that bowl.
ACTION: Make one small finishing transfer of broth. Bring the ladle a little closer to the bowl, then tilt it once toward the open broth beside the food. Let a short, broad, coherent flow of brown broth enter close to the surface. The amount in the ladle decreases while the bowl's liquid level rises modestly. Only nearby leaves yield slightly to the incoming broth; keep the beef and cabbage identity and placement coherent. This is a finishing addition, not a refill to the brim. Ease the ladle back toward level with a little broth still in it and let the receiving surface settle. Do not perform a second pour or show lingering last drops. No new solids may emerge from this broth-only ladle.
CAMERA: Locked closer oblique framing of the white bowl and ladle, preserving the start image's scale and background pot. Do not zoom or move into a new angle.
HEAT STATE: Off the heat in the serving bowl. No added bubbles, boiling, foam, steam, or haze.
AUTHORIZED LIQUID ACTION: One short real broth pour. The main flow stays connected and follows gravity, with a restrained local surface response. It must not become a thin suspended liquid thread or separated display droplets.

Keep ingredients identifiable and conserve the total quantity throughout the shot. Soft cooked leaves may bend and settle naturally, without morphing into new ingredients. Keep the metal utensil rigid and its handle coherently connected beyond the frame. No ingredient duplication, texture crawling, unsupported floating food, transparent amber broth, uniform plastic gloss, or unexplained background movement. Do not add tofu, zucchini, mushrooms, noodles, eggs, new garnish, visible hands, or new table props. No decorative droplets, hanging drops, thin syrup-like liquid threads, splashes, or geometric ripple rings. Do not add steam, vapor, haze, or a dramatic boil.

One uninterrupted shot only: no internal edit, dissolve, wipe, flash, speed ramp, transition zoom, or montage. Ordinary controlled serving speed, not exaggerated slow motion. Landscape 16:9, 1280x720, silent, no text or graphics. Keep sufficient clean motion for a 1.5-2 second excerpt from the 4-5 second source clip. Any outgoing hard cut is added later in editing; do not generate it inside this clip.
```

### B-ladle-video-v2.txt

Source:`doenjang-hero-video-20261030/prompts/B-ladle-video-v2.txt`

```text
One continuous four-second natural food shot from the supplied image. The stainless ladle already holds the correct serving at the pot surface. Make only ONE tiny upward adjustment of 5 millimetres during the first 0.8 seconds, then settle and keep it at this same very low height. The ladle must remain directly over the soup and its underside never rises above the nearby pot rim. Its entire loaded bowl stays in the same small region of the frame. It does NOT rise toward the camera or travel into the background. All cabbage, beef, scallion and liquid remain contained and supported in the ladle. Keep the lip level. No draining, dripping, flowing threads or attached liquid tails beneath the ladle. There is no pouring action. Camera locked at the supplied angle and distance; no tracking, reframing, zoom, orbit or pan. Preserve the exact supplied black pot, table, actual cooked beef/cabbage, cloudy brown doenjang broth and uneven existing foam. Keep the soup below substantially calm, with at most a few subtle existing simmer bubbles. No circular impact ripples, steam, new foam, splashes, ingredient changes, stretching cabbage, texture crawling, sharpened micrograin, plastic gloss, extra utensil or hand. Do not make a large heroic lift or a dramatic slow-motion food shot. Natural restrained motion only, one shot, silent, no text, no cut or transition.
```

### D-serve-close-video-v2.txt

Source:`doenjang-hero-video-20261030/prompts/D-serve-close-video-v2.txt`

```text
Create a single natural four-second close food video from this exact reference frame. This is Korean beef and napa-cabbage doenjang SOUP. Its cloudy brown color comes from suspended soybean particles, NOT from thickness. The liquid has the low viscosity and quick gravity response of ordinary hot soup or miso soup: watery, loose, mobile, irregular, non-sticky, with tiny suspended particles. Preserve that cloudy brown soup color without making it transparent. The bowl already contains exactly the beef, soft long cabbage leaves and scallion shown. Keep their shapes and positions coherent. One ordinary serving action: the broth-only ladle lowers close to the bowl, until its lip is only 2–3 cm above the cabbage. It then tilts gently and pours a small amount of loose soup quickly into the bowl. Show a short irregular rippled flow that spreads immediately between the ingredients; thin changing edges, no persistent smooth triangular membrane, no glossy surface coating. The liquid empties naturally rather than stretching. Stop before an isolated final drip. No long tapering tail, elastic thread, hanging bead, syrup, gravy, caramel, gel, thick sauce, puree, dramatic droplets, splash crown, new foam, added steam or slow motion. Never lift the ladle higher. The lip stays close to the food throughout the pour. Camera completely locked to the input angle, close framing and natural light. No zoom, pan, orbit, montage or transition. No added ingredient, no tofu, no reformed beef, no crawling texture, no disappearing food, no melting spoon. The pot in the background remains stable. Natural ordinary serving physics; no decorative food-advertising gesture. Silent, no text.
```

### D-serve-close-video-v3-wan.json

Source:`doenjang-hero-video-20261030/prompts/D-serve-close-video-v3-wan.json`

```json
{
  "prompt": "Locked-off close camera, natural real-time kitchen food footage. A stainless ladle pours ordinary hot Korean beef-and-cabbage soybean soup into the serving bowl shown. The ladle first approaches the food closely, then makes one modest forward tilt. Loose low-viscosity soup pours briefly from its lip, immediately dispersing between the cabbage and beef. Cloudy medium-brown soup with suspended soybean grains, watery fluid motion like normal miso soup. A short irregular flow with changing rippled edges, not a thick smooth membrane. Keep the ladle close to the bowl, at most two centimeters above the cabbage while pouring. Keep all existing food, bowl, ladle, black background pot, daylight and camera composition exactly consistent with the image. All solid food stays in the bowl. Simple ordinary serving, no dramatic display. Preserve the cloudy brown color and modest portion. Single continuous shot at natural speed.",
  "negative_prompt": "syrup, caramel, gravy, sauce, honey, puree, thick liquid, stretchy liquid, gelatin, smooth triangular liquid membrane, transparent amber water, isolated droplets, hanging beads, liquid strings, splash crowns, steam, smoke, boiling bowl, added ingredients, tofu, morphing beef, duplicated food, artificial glossy coating, plastic, CGI, deformed ladle, dissolving utensil, floating food, camera zoom, pan, cut, transition, slow motion, text",
  "model": "wan-video/wan-2.5-i2v",
  "duration": 5,
  "resolution": "720p",
  "enable_prompt_expansion": false,
  "seed": 2026103235
}
```

## Prompt snapshot hashes

| Source file | SHA256 |
|---|---|
| `prompts/A-pot-video.txt` | `39c0060db3cd5e24e65019e9c32cc4e7d17767e766c416ae9f0eea890a56ddb1` |
| `prompts/B-ladle-video.txt` | `a99cc61a9b89b61abfe084f164bba2c24bfbbf3fc31249b0603b0ce63676e345` |
| `prompts/C-serve-wide-video.txt` | `10810297f483d217fba7075a660bf4edace3fe868bff8a7eb5799b3a52e93497` |
| `prompts/D-serve-close-video.txt` | `9f00a29fcd43ac1973f6000a9b2ad91d256e10f1a4af2e38d3deb16dce6d1605` |
| `prompts/B-ladle-video-v2.txt` | `6d34a34989b45bef8521a35c8e23b4b112f6d01f7b25df8abf54be0cf5da1b5d` |
| `prompts/D-serve-close-video-v2.txt` | `25b168199056a337b6c3d5132805d73d4fa5fc3e5029a7ad65fee6b4419fac65` |
| `prompts/D-serve-close-video-v3-wan.json` | `d40471d92d21ffd64ba441220c6b59a81d9042ce14677621b8e91d353eeddf22` |

## Historical initial-plan correction

`prompts/SHOT_INPUTS.json` is the initial plan, not current execution status. Its original zero paid calls, model:null and not-submitted flags remain historical. Only A's current prompt hash/character count was refreshed; record_role,historical_state_notice and execution_records now explain the distinction and link current results.

```json
{
  "record_role": "historical_initial_plan; execution has occurred later",
  "historical_state_notice": "The original prompt_prepared/not submitted, model:null and paid_generation_calls:0 fields describe preparation time only. They are not current execution status. The A prompt hash/character count was refreshed to the current source file on2026-10-30; consult execution records for generated results.",
  "A_current_prompt_sha256": "39c0060db3cd5e24e65019e9c32cc4e7d17767e766c416ae9f0eea890a56ddb1",
  "A_current_prompt_characters": 2529,
  "execution_records": {
    "current_archive": "../ARCHIVE.md",
    "first_batch_results": "../generation/results.json",
    "B_v2_result": "../generation/B-v2-result.json",
    "D_v2_result": "../generation/D-v2-result.json",
    "D_v3_job": "../generation/D-v3-job.json",
    "current_edit_plan": "../qa/edit-decision.json (when finalized)",
    "render_manifest": "../outputs/render-manifest.json (when generated)"
  }
}
```

## Assembly script source snapshot

Source:`doenjang-hero-video-20261030/build_video.py`. Preserve this code for continuation without another standalone archive file. It reads finalized qa/edit-decision.json; embedding the code does not execute it. Current local ffmpeg/ffprobe paths are preserved exactly and may need adjustment on another computer. The finalized draft source selection and observed render summary are included below; native D QA is still pending.

```python
#!/usr/bin/env python3
"""Build the four-shot product 32 hero from reviewed native-frame intervals."""
import argparse
import hashlib
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent
FFMPEG = "/opt/homebrew/bin/ffmpeg"
FFPROBE = "/opt/homebrew/bin/ffprobe"

def run(args):
    subprocess.run(args, check=True)

def probe(path):
    return json.loads(subprocess.check_output([
        FFPROBE, "-v", "error", "-count_frames",
        "-show_streams", "-show_format", "-of", "json", str(path)
    ]))

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--decision", default="qa/edit-decision.json")
    args = parser.parse_args()
    decision = json.loads((ROOT / args.decision).read_text())
    if [c["key"] for c in decision["clips"]] != ["A", "B", "C", "D"]:
        raise ValueError("All four reviewed shots are required in order.")
    out = ROOT / "outputs"
    out.mkdir(exist_ok=True)
    timeline = []
    paths = []
    total_frames = 0
    rate = 30000 / 1001
    for clip in decision["clips"]:
        src = ROOT / clip["source"]
        start, end = clip["source_frames_start_inclusive_end_exclusive"]
        if not (src.is_file() and 0 <= start < end):
            raise ValueError(f"Invalid selection: {clip}")
        dest = out / f'32-{clip["key"]}-cut.mp4'
        filt = (f"trim=start_frame={start}:end_frame={end},"
                "setpts=PTS-STARTPTS,fps=30000/1001,"
                "setsar=1,format=yuv420p")
        run([FFMPEG, "-hide_banner", "-loglevel", "error", "-y",
             "-i", str(src), "-map", "0:v:0", "-vf", filt,
             "-an", "-c:v", "libx264", "-preset", "medium",
             "-crf", "18", "-movflags", "+faststart", str(dest)])
        info = probe(dest)
        stream = next(s for s in info["streams"] if s["codec_type"] == "video")
        frames = int(stream["nb_read_frames"])
        timeline.append({**clip, "output": str(dest.relative_to(ROOT)),
                         "output_frames": frames,
                         "timeline_start_frame": total_frames,
                         "timeline_end_frame_exclusive": total_frames + frames,
                         "timeline_start_seconds": total_frames / rate,
                         "timeline_end_seconds": (total_frames + frames) / rate})
        total_frames += frames
        paths.append(dest)
    concat = out / "concat.txt"
    # Generated segment basenames contain no quotes; resolve within outputs/.
    concat.write_text("".join(f"file '{p.name}'\n" for p in paths))
    final = out / "32-doenjang-hero-v1.mp4"
    run([FFMPEG, "-hide_banner", "-loglevel", "error", "-y",
         "-f", "concat", "-safe", "1", "-i", str(concat),
         "-c", "copy", "-an", "-movflags", "+faststart", str(final)])
    run([FFMPEG, "-hide_banner", "-loglevel", "error", "-i",
         str(final), "-f", "null", "-"])
    info = probe(final)
    video = next(s for s in info["streams"] if s["codec_type"] == "video")
    assert video["width"] == 1280 and video["height"] == 720
    assert video["pix_fmt"] == "yuv420p"
    assert video["avg_frame_rate"] == "30000/1001"
    assert len(info["streams"]) == 1
    assert int(video["nb_read_frames"]) == total_frames
    run([FFMPEG, "-hide_banner", "-loglevel", "error", "-y", "-i",
         str(final), "-frames:v", "1", "-q:v", "2", str(out / "poster.jpg")])
    result = {"file": str(final.relative_to(ROOT)), "bytes": final.stat().st_size,
              "sha256": hashlib.sha256(final.read_bytes()).hexdigest(),
              "frames": total_frames, "fps": "30000/1001",
              "duration_seconds": float(info["format"]["duration"]),
              "speed": "native 1x; no motion interpolation or slow-motion",
              "transitions": "0-frame hard cuts", "clips": timeline,
              "probe": info}
    (out / "render-manifest.json").write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({k: result[k] for k in ["file","bytes","sha256","frames","fps","duration_seconds"]}))

if __name__ == "__main__":
    main()
```

## Review-draft render and validation

Source records: qa/edit-decision.json and outputs/render-manifest.json. The output is a review draft, not final photographic approval. No storefront deployment has occurred.

Parent reports full decode passed, three internal cut boundaries checked, and browser autoplay/loop/muted/native1x playback worked. These are parent-observed checks, not a new browser test by this archive worker. Final native-resolution D visual QA is in progress.

Known limits: some start-image gloss and cooked-beef texture remain. B is intentionally a low supported hold rather than the reference's rise, because the defective rising interval was excluded. The source still artifacts are not certified as fully photographic. Wan's source contains an audio stream; the assembly uses -an and the rendered output is silent.

### Exact draft edit decision

```json
{
  "product_no": 32,
  "output_status": "review_draft",
  "reference": "https://cookatmarket.com/ko/product/detail?product_id=2094",
  "source_fps": 24,
  "output_fps": "30000/1001",
  "transitions": "hard_cut_0f",
  "speed": 1,
  "audio": false,
  "clips": [
    {
      "key": "A",
      "source": "raw/A-v1.mp4",
      "source_frames_start_inclusive_end_exclusive": [
        8,
        48
      ],
      "action": "Localized gentle simmer, locked pot view"
    },
    {
      "key": "B",
      "source": "raw/B-v2.mp4",
      "source_frames_start_inclusive_end_exclusive": [
        40,
        84
      ],
      "action": "Low stable hold of the loaded ladle; intentionally omit the defective rise"
    },
    {
      "key": "C",
      "source": "raw/C-v1.mp4",
      "source_frames_start_inclusive_end_exclusive": [
        56,
        92
      ],
      "action": "Low transfer of solids into the bowl; omit early thin flow and final tail"
    },
    {
      "key": "D",
      "source": "raw/D-v3-wan.mp4",
      "source_frames_start_inclusive_end_exclusive": [
        35,
        77
      ],
      "action": "Short low broth pour; Wan comparison replaces rejected syrup-like Seedance versions"
    }
  ]
}
```

### Observed render manifest (public-safe fields)

```json
{
  "file": "outputs/32-doenjang-hero-v1.mp4",
  "bytes": 3467947,
  "sha256": "465279b7c5f26e355b30a001aa1b75d38c8538e90641079aef39333fcd5bf59a",
  "frames": 202,
  "fps": "30000/1001",
  "duration_seconds": 6.740067,
  "speed": "native 1x; no motion interpolation or slow-motion",
  "transitions": "0-frame hard cuts",
  "clips": [
    {
      "key": "A",
      "source": "raw/A-v1.mp4",
      "source_frames_start_inclusive_end_exclusive": [
        8,
        48
      ],
      "action": "Localized gentle simmer, locked pot view",
      "output": "outputs/32-A-cut.mp4",
      "output_frames": 50,
      "timeline_start_frame": 0,
      "timeline_end_frame_exclusive": 50,
      "timeline_start_seconds": 0.0,
      "timeline_end_seconds": 1.6683333333333334
    },
    {
      "key": "B",
      "source": "raw/B-v2.mp4",
      "source_frames_start_inclusive_end_exclusive": [
        40,
        84
      ],
      "action": "Low stable hold of the loaded ladle; intentionally omit the defective rise",
      "output": "outputs/32-B-cut.mp4",
      "output_frames": 55,
      "timeline_start_frame": 50,
      "timeline_end_frame_exclusive": 105,
      "timeline_start_seconds": 1.6683333333333334,
      "timeline_end_seconds": 3.5035000000000003
    },
    {
      "key": "C",
      "source": "raw/C-v1.mp4",
      "source_frames_start_inclusive_end_exclusive": [
        56,
        92
      ],
      "action": "Low transfer of solids into the bowl; omit early thin flow and final tail",
      "output": "outputs/32-C-cut.mp4",
      "output_frames": 45,
      "timeline_start_frame": 105,
      "timeline_end_frame_exclusive": 150,
      "timeline_start_seconds": 3.5035000000000003,
      "timeline_end_seconds": 5.005
    },
    {
      "key": "D",
      "source": "raw/D-v3-wan.mp4",
      "source_frames_start_inclusive_end_exclusive": [
        35,
        77
      ],
      "action": "Short low broth pour; Wan comparison replaces rejected syrup-like Seedance versions",
      "output": "outputs/32-D-cut.mp4",
      "output_frames": 52,
      "timeline_start_frame": 150,
      "timeline_end_frame_exclusive": 202,
      "timeline_start_seconds": 5.005,
      "timeline_end_seconds": 6.740066666666666
    }
  ],
  "width": 1280,
  "height": 720,
  "audio": false,
  "status": "review_draft; native D review complete; conditional draft pass",
  "storefront_deployment": false
}
```

### Final native D QA

Pending the reviewing agent's final result. Update this paragraph and CURRENT_STATE.json/doenjang_hero_video/final_native_D_qa before the parent uploads the four text files.

## GitHub connector check

Read-only fetch_file for DA-Creation/donghwa-garden-preview, work-archive/CURRENT_STATE.json returned UNAUTHORIZED on 2026-10-30: "This app connection requires reauthentication. Reconnect the app and try again." No upload or commit was attempted by this archive task.

## Final-result update locations

Update this document and staging DOENJANG_HERO_VIDEO_20261030.md together. Then update CURRENT_STATE.json/doenjang_hero_video, this video's CHANGELOG.md entry, and the document's file-map.json sha256/bytes. Existing still-image archive remains unchanged. Parent will handle any later upload separately; no upload or deployment success is currently recorded.

## Final review addendum

D selection is [35,77),42 native frames. The earlier [18,60) candidate was replaced to omit the strongest smooth triangular flow at f24-34. All42 selected D frames were inspected at native pixel scale: no independent droplets, hanging threads or tool collapse. A short low transfer and settling remain. Some glossy contact surface and pronounced soybean particles persist; this is a review draft, not a claim of photographic equivalence.

Final verification is in qa/final-reviewed/: all202 output frames decoded, no audio, and exactly three scene boundaries at1.668333,3.5035,5.005seconds. The earlier qa/final-v1/ describes the superseded D interval. Browser autoplay, muted loop and normal speed were checked; no physical mobile-device test is claimed.
