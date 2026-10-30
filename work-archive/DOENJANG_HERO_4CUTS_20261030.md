# 상품32 된장찌개 히어로 시작 이미지4컷

기록일: 2026-10-30. 상태: **4컷 시작 이미지 초안 제작·시각 검토 완료, 사용자 확인 전. 영상 생성 및 상세페이지 배포는 하지 않음.**

내장 image_gen으로 별도4컷을 만들었다. D의1·2차 결과는 고기 표면의 반복 돌기 때문에 제외하고, 실제 사진을 질감 우선참조로 다시 생성한3차를 선택했다. 총6회 이미지 생성. 이미지/참고미디어는 iCloud 로컬에만 있고 GitHub에는 이 텍스트와 경로·해시만 보관한다.

## 참조와 검토

음식 정체성: thumbnail-generation-20261028/evidence/source-images/32-original-detail-1.jpg 및32-original-detail-2.jpg를 실제로 열어 확인했다. 검은 양손잡이 얕은 냄비, 탁한 갈색 된장국물, 무른 긴 우거지와 불규칙한 익힌 소고기, 파를 유지한다. 일반 된장찌개처럼 두부·애호박·버섯을 새 건더기로 넣지 않는다.

움직임/컷 기능: https://cookatmarket.com/ko/product/detail?product_id=2094 의 실제 히어로 영상에서 전경→국자 상승→넓은 덜기→근접 국물 컷을 가져왔다. 쿠캣의 면/고기/그릇은 옮기지 않는다. 영상 프레임 시트 hero-motion.jpg를 재확인했다. 흰 그릇은 별도 서빙 소품이며 상품 동봉 구성이라는 의미가 아니다. 공통 기준은 VIDEO_GENERATION_COMMON_PROMPT.md.

A/B/C는 실제 식재료·국물·냄비·도구 지지·금지 물방울 여부를 대조했다. D-v3은 D-v1/v2보다 고기의 넓고 불규칙한 면이 살아 있어 선택했다. 잔여 한계: 실사와 동일하다는 보장이 아니고 고기 윤곽/젖은 반사가 원본보다 선명하다. B→C와 C→D는 재료 배치가 완전히 같은 매치컷이 아니므로 별도 시점의 짧은 하드컷으로 연결한다. 시작 이미지 통과는 향후 생성 영상의 움직임 통과를 뜻하지 않는다. 생성 영상은 별도 검토해야 한다.

## 컷 계획


상품32 소고기 우거지 된장찌개. 공통기준: ../VIDEO_GENERATION_COMMON_PROMPT.md. 실제 상품 원본 detail1/2를 음식 정체성으로, 쿠캣2094를 컷 기능/구도/움직임 레퍼런스로 사용한다. 쿠캣의 면·재료·그릇은 옮기지 않는다. 기존 생성32이미지는 정체성 근거로 사용하지 않는다.

|컷|시작 상태|향후 움직임|카메라|다음 연결|
|---|---|---|---|---|
|A|실제 검은 냄비 전경, 작은 불규칙 기포|국소적인 잔잔한 끓음|거의 고정|하드컷0f|
|B|국자가 국물 표면 가까이에서 한입을 지지|낮게 들어 올림|필요한 만큼 위쪽 따라가기|하드컷0f|
|C|빈 작은 흰 그릇 바로 위, 내용물을 담은 국자|짧게 기울여 건더기를 덜기|넓은 고정 구도|하드컷0f|
|D|같은 그릇에 건더기가 놓임, 남은 국물을 담은 국자|작은 국물 마무리 옮김|가까운 고정 구도|첫 컷으로 하드컷 루프|

이미지는 각각 별도16:9파일. 기울이기 전 상태이며 장식적인 물방울·액체 실·공중 식재료를 넣지 않는다. 모든 국자를 뜬 채로 한입 흔들기로 통일하지 않는다. A의 기포는 실제32원본의 끓는 상태 근거이며42번의 별도 금지조건과 혼동하지 않는다. C/D의 흰 그릇은 덜어먹는 연출 소품이며 동봉구성 표시가 아니다. 영상 생성/실서버 배포는 이번 요청에 포함하지 않는다. 생성 이미지와 참고 미디어는 iCloud 로컬에만 보관한다.


## 선택 파일과 해시

```json
{
  "product_no": 32,
  "status": "four draft start frames selected after visual review; user approval pending",
  "method": "built-in image_gen",
  "generation_calls": 6,
  "video_generated": false,
  "deployed": false,
  "media_to_github": false,
  "images": [
    {
      "id": "A",
      "path": "images/A-pot-v1.png",
      "dimensions": [
        1672,
        941
      ],
      "sha256": "e8ece93a8eaddd8e5bf14af1a26e6ea034aa21245562d1ef607846bee3b512f3",
      "bytes": 2778296
    },
    {
      "id": "B",
      "path": "images/B-ladle-v1.png",
      "dimensions": [
        1672,
        941
      ],
      "sha256": "72437da01698bded4ea75061530f6235d1e0590156599d9e652f928f4c8046b3",
      "bytes": 2637921
    },
    {
      "id": "C",
      "path": "images/C-serve-wide-v1.png",
      "dimensions": [
        1672,
        941
      ],
      "sha256": "92c821fb07e7108176f75f45eb4c1d2216a04380ad7dcf419d7493298402c729",
      "bytes": 2278146
    },
    {
      "id": "D",
      "path": "images/D-serve-close-v3.png",
      "dimensions": [
        1672,
        941
      ],
      "sha256": "dc99c7e5d22ad52bb1d71765c93ef0fc9e632371068e951555ec840c15f30884",
      "bytes": 2275661
    }
  ],
  "rejected": [
    "images/D-serve-close-v1.png",
    "images/D-serve-close-v2.png"
  ],
  "rejection_reason": "Beef retained repetitive densely raised texture; Dv2 did not materially improve it."
}
```

## 사용한 전체 프롬프트

### 01-pot.txt

```text
Use case: photorealistic-natural. Create ONE separate landscape16:9 food photograph, ideally1920x1080, as a START FRAME for a Donghwa Garden food video, not a collage. Reference1 is the ACTUAL complete product and black shallow two-loop-handle metal cooking pan. Reference2 is the ACTUAL cooked beef and wilted cabbage texture and stainless serving ladle. These real product photos are the authority. This is product32, Korean beef and wilted napa cabbage doenjang stew, NOT generic tofu doenjang soup. Preserve muddy medium/deep brown opaque soybean-paste broth, long soft olive-brown napa cabbage leaves and pale-brown ribs, modest irregular cooked beef pieces and a few uneven white/light-green scallion pieces. No tofu, zucchini, mushrooms, carrots, noodles, eggs, seafood or added garnishes. Broth remains liquid and cloudy, not clear amber water, gelatin, glossy syrup or thick puree. Natural soft cooked fibres, uneven sizes, restrained wet reflections; do not sharpen fine grain or make intricate repeating leaf patterns. Use the same light warm wooden tabletop as the real reference, subdued soft natural daylight from the left, neutral color balance, believable shallow depth of field, honest food photography. Background is quietly out of focus, no styled feast or extra dishes. No dramatic steam, detached drops, hanging droplets, liquid strings, splashes, decorative ripple rings, over-polished metal, CGI shine, text, letters, watermark or borders.

SHOT 01-pot: Wide establishing close view, elevated oblique angle similar to the analyzed Cookat2094 first shot. Show the actual black pan and both low loop handles clearly enough to establish the vessel. The food occupies most of the frame but sits naturally half-submerged, never stacked in a tall mound. A few irregular tiny simmer bubbles and small patchy natural foam from the original cooking photo are allowed; no explosive boil or uniform foam carpet. No utensil or hand in this frame. This frame will animate with only modest local simmering; camera nearly locked. Preserve the original ingredient proportions rather than arranging a neat garnish pattern.
```

### 02-ladle.txt

```text
Use case: photorealistic-natural. Create ONE separate landscape16:9 food photograph, ideally1920x1080, as a START FRAME for a Donghwa Garden food video, not a collage. Reference1 is the ACTUAL complete product and black shallow two-loop-handle metal cooking pan. Reference2 is the ACTUAL cooked beef and wilted cabbage texture and stainless serving ladle. These real product photos are the authority. This is product32, Korean beef and wilted napa cabbage doenjang stew, NOT generic tofu doenjang soup. Preserve muddy medium/deep brown opaque soybean-paste broth, long soft olive-brown napa cabbage leaves and pale-brown ribs, modest irregular cooked beef pieces and a few uneven white/light-green scallion pieces. No tofu, zucchini, mushrooms, carrots, noodles, eggs, seafood or added garnishes. Broth remains liquid and cloudy, not clear amber water, gelatin, glossy syrup or thick puree. Natural soft cooked fibres, uneven sizes, restrained wet reflections; do not sharpen fine grain or make intricate repeating leaf patterns. Use the same light warm wooden tabletop as the real reference, subdued soft natural daylight from the left, neutral color balance, believable shallow depth of field, honest food photography. Background is quietly out of focus, no styled feast or extra dishes. No dramatic steam, detached drops, hanging droplets, liquid strings, splashes, decorative ripple rings, over-polished metal, CGI shine, text, letters, watermark or borders.

SHOT 02-ladle: A closer lower oblique view of the same pan and same food. A plain stainless serving ladle with an all-metal handle enters diagonally from upper right. Its bowl supports a modest serving of wilted cabbage and two or three small irregular beef pieces, still touching or barely clearing the broth surface: this is the START of a LOW lift, not the end pose in mid-air. Keep the ladle bowl visible and physically supporting the food. Cabbage is softly folded and mostly contained on the ladle, without long dangling wet ribbons. Leave headroom for the ladle to move upward in the future video. No stream, drops or liquid bridge beneath it. Match the pot, tabletop, light and scale of the provided shot01 continuity image if present.
Reference3 is the generated shotA, used ONLY for matching vessel, table, daylight and color across shots; reference1/2 remain the authority for actual food.
```

### 03-serve-wide.txt

```text
Use case: photorealistic-natural. Create ONE separate landscape16:9 food photograph, ideally1920x1080, as a START FRAME for a Donghwa Garden food video, not a collage. Reference1 is the ACTUAL complete product and black shallow two-loop-handle metal cooking pan. Reference2 is the ACTUAL cooked beef and wilted cabbage texture and stainless serving ladle. These real product photos are the authority. This is product32, Korean beef and wilted napa cabbage doenjang stew, NOT generic tofu doenjang soup. Preserve muddy medium/deep brown opaque soybean-paste broth, long soft olive-brown napa cabbage leaves and pale-brown ribs, modest irregular cooked beef pieces and a few uneven white/light-green scallion pieces. No tofu, zucchini, mushrooms, carrots, noodles, eggs, seafood or added garnishes. Broth remains liquid and cloudy, not clear amber water, gelatin, glossy syrup or thick puree. Natural soft cooked fibres, uneven sizes, restrained wet reflections; do not sharpen fine grain or make intricate repeating leaf patterns. Use the same light warm wooden tabletop as the real reference, subdued soft natural daylight from the left, neutral color balance, believable shallow depth of field, honest food photography. Background is quietly out of focus, no styled feast or extra dishes. No dramatic steam, detached drops, hanging droplets, liquid strings, splashes, decorative ripple rings, over-polished metal, CGI shine, text, letters, watermark or borders.

SHOT 03-serve-wide: Wider oblique serving setup. Use the same actual black pot in the softly blurred background and the same wooden tabletop/light. A small plain off-white ceramic eating bowl sits centered in the foreground, EMPTY apart from a faint wet trace; no rice or noodles or garnish inside. The same plain all-metal stainless ladle is held low just above the bowl rim from upper right, loaded with a modest portion of the actual brown broth, soft long wilted cabbage and small beef pieces. Ladle is level or only minimally tilted and the liquid is fully contained: the precise moment BEFORE tipping to serve. The future motion is one short controlled transfer into the bowl. Do not depict pouring yet. No hanging cabbage below the ladle, no liquid string, drip, airborne food or hand. The new off-white bowl is only a serving prop, not packaging.
Reference3 is generated shotA, used ONLY for matching vessel, table, daylight and color across shots; reference1/2 remain the authority for actual food. The ladle should be a normal shallow oval stainless serving ladle, as in actual reference2, with a plain narrow all-metal handle. Both food on the ladle and the receiving bowl should read clearly; the empty bowl must not dominate the image.
```

### 04-serve-close.txt

```text
Use case: photorealistic-natural. Create ONE separate landscape16:9 food photograph, ideally1920x1080, as a START FRAME for a Donghwa Garden food video, not a collage. Reference1 is the ACTUAL complete product and black shallow two-loop-handle metal cooking pan. Reference2 is the ACTUAL cooked beef and wilted cabbage texture and stainless serving ladle. These real product photos are the authority. This is product32, Korean beef and wilted napa cabbage doenjang stew, NOT generic tofu doenjang soup. Preserve muddy medium/deep brown opaque soybean-paste broth, long soft olive-brown napa cabbage leaves and pale-brown ribs, modest irregular cooked beef pieces and a few uneven white/light-green scallion pieces. No tofu, zucchini, mushrooms, carrots, noodles, eggs, seafood or added garnishes. Broth remains liquid and cloudy, not clear amber water, gelatin, glossy syrup or thick puree. Natural soft cooked fibres, uneven sizes, restrained wet reflections; do not sharpen fine grain or make intricate repeating leaf patterns. Use the same light warm wooden tabletop as the real reference, subdued soft natural daylight from the left, neutral color balance, believable shallow depth of field, honest food photography. Background is quietly out of focus, no styled feast or extra dishes. No dramatic steam, detached drops, hanging droplets, liquid strings, splashes, decorative ripple rings, over-polished metal, CGI shine, text, letters, watermark or borders.

SHOT 04-serve-close: A substantially tighter oblique close-up of the SAME plain off-white bowl and same serving setup as shot03. The bowl now contains the modest cabbage and small beef pieces transferred in the preceding shot, resting naturally low in a shallow amount of the same muddy brown broth. No neat arrangement or extra ingredients. Above the bowl at upper right, the SAME stainless ladle holds the remaining brown liquid, poised low at the rim and nearly level before a small finishing tip. The liquid remains in the ladle: no visible pouring stream, thread, suspended drop or splash. This is a START FRAME for the final small broth transfer, not a frozen liquid-effect shot. Preserve bowl identity, table, direction of light, ingredient proportions and the soft actual beef/cabbage texture. The food fills the frame; the distant black pan can be softly hinted at only if naturally visible.
Reference3 is the generated shotC: the same off-white slightly speckled ceramic bowl, shallow all-metal serving ladle, table/light and staging must persist. Reference4 is generated shotB for ladle continuity only. Actual references1/2 remain food identity authority. Show roughly the same amount of cabbage and 2-3 small beef pieces that were on the ladle in shotC, now in the bowl; do not multiply the food. Put most solids in the bowl, and brown broth only in the ladle. The crop is significantly tighter than shotC, but still shows the physical gap between the ladle and bowl.
```

### 04b-serve-close-texture-edit.txt

```text
Edit reference1 (the generated shotD) to improve ONLY food texture realism. Reference2 is the ACTUAL product photograph and the sole authority for cooked beef texture. Preserve reference1's composition, exact off-white bowl, metal ladle with contained cloudy brown broth, black pot background, tabletop, daylight, camera position, amount and placement of food. Keep the same 2-3 beef pieces, softened cabbage and scallion; add nothing. The beef in reference1 has overly regular deeply wrinkled pebbled puzzle/brain-like patterns: replace those rendered ridges with the subtler, irregular softened gray-brown cooked muscle fibres visible in reference2, with naturally torn edges and varying fibre direction. No ground-beef nodules, scored grill lines, geometric cracks, reptile pattern, uniform granular crust or sharp microcontrast. Some broad softer areas on each beef piece should remain visible rather than covering every millimetre in detail. Preserve credible moisture without varnished highlights; avoid airbrushing. Very slightly reduce excessive sharpening on the beef and cabbage only, not a blurry whole-image filter. Do not brighten or clarify the opaque brown broth. Keep the ladle level with the liquid fully contained, absolutely no stream, detached drop, liquid strand or steam. Return one separate landscape image, same 1672x941 composition and proportions, no text.
```

### 04c-serve-close-real-beef.txt

```text
Generate one fresh landscape16:9 START FRAME for shotD of product32, Korean beef and wilted napa-cabbage doenjang stew. Do not create a collage. Reference1 is the ACTUAL product and is the authority for the food's cooked state and especially the beef. Reference2 is generated shotC: use it ONLY for the off-white speckled bowl, stainless serving ladle, wooden table, black two-handle pan in the background, light direction and serving continuity. Create a tighter view of that same serving bowl after its ladleful of food has been transferred. The bowl contains the same modest serving of very soft long olive-brown cabbage leaves/stems, a few scallion pieces and only TWO small irregular pieces of naturally cooked gray-brown beef, in muddy opaque brown soybean-paste broth. Beef pieces should be low, irregularly torn pieces with some flat broken faces and subtly visible long muscle fibres, like the actual beef in reference1. Render these two beef pieces anew from the actual photo: varying fibre direction, broad areas of soft low-detail cooked meat, uneven broken edges, partly submerged lower sides. Ordinary small gently cooked beef pieces, not compact mounds. Avoid covering the surface with continuous deep wrinkles or repetitive patterned detail. Do not use the sculpted beef lumps in reference2 as a texture guide. Keep the portion low and informal, not a food tower. The same metal ladle sits low over the upper-right rim, nearly level and containing only some remaining brown broth, immediately before a small finishing tip. Nothing is pouring yet. No drops, threads, suspended food, splashes, steam, new garnishes, extra meat, rice, noodles, tofu, zucchini, mushrooms or text. The liquid is cloudy brown, not transparent or orange, with subtle natural seasoning suspension. Accurate mildly wet cabbage, no lacquer finish. Natural camera rendering with restrained sharpening and modest detail, not an ultra-crisp CGI macro. The source photo's soft detail is valid: do not invent texture where it is indistinct. Keep this as the fourth shot of the same real meal and same utensils.
```

## 프롬프트 SHA256

- `prompts/01-pot.txt`: `b797fbd57395aee822a50abe2e96f0264efe8950998f6d70d5b77d348cfc4982`
- `prompts/02-ladle.txt`: `56f6555a4df9d825f453335726ca36641809db92b40d614587210406408f70a0`
- `prompts/03-serve-wide.txt`: `339580ce24243274e7ea15a88e689cb918258db537f94b2cd4ceac90d3a6e7ea`
- `prompts/04-serve-close.txt`: `ea9e0d692f7909087b1aa1a0174e5eea2e043906644acaa83a10772f2987f31f`
- `prompts/04b-serve-close-texture-edit.txt`: `e595599bce40982309ccdc4df37978ffc216a044ce88093442d72c1afd6faec7`
- `prompts/04c-serve-close-real-beef.txt`: `c3222c261982d13f6ab94f2560f092419f8003143b143358737840add237d1d7`
