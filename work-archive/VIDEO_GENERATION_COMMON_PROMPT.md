# 동화가든 공통 영상 생성 프롬프트

버전 1.0 · 2026-10-30 · 영상 생성 전 읽는 기준 파일

이 파일의 역할은 실제 상품의 정체성을 유지하면서, 확인한 레퍼런스의 컷 구성과 움직임을 재현하는 것이다. 모델에 파일 전체를 그대로 넣지 않는다. 아래 입력표를 채운 뒤 공통 본문과 해당 컷 모듈을 합쳐 **컷마다 별도 프롬프트**를 만든다. 컷 연결과 전환은 편집 지시서로 분리한다.

## 1. 이번에 직접 확인한 레퍼런스

- 페이지: https://cookatmarket.com/ko/product/detail?product_id=2094
- 대상: 쿠캣 차돌 짬뽕탕 상품 페이지의 상단 대표영상과 상세 첫 히어로영상.
- 대표영상: https://crcf.cookatmarket.com/video/product_thumbnail/2024/07/hemu_1722408325_6921/MP4/hemu_1722408325_6921.mp4
- 상세 히어로: https://crcf.cookatmarket.com/video/product_detail/2024/07/cofu_1721284012_9574/MP4/cofu_1721284012_9574.mp4
- 페이지의 실제 video 요소, MP4 메타데이터, 전체 디코딩 프레임과 컷 경계 앞뒤를 확인했다. 장면 감지 결과는 후보 탐색에 사용했고 컷 여부는 인접 프레임으로 판정했다.
- 참고 영상·프레임 시트는 로컬 `video-production-guide/local-reference/cookat-2094/`에만 둔다. GitHub에 미디어를 올리지 않는다.

| 구분 | 확인한 배포 파일 | 편집 구성 | 웹 재생 |
|---|---|---|---|
| 상단 대표영상 | 720×720, 30000/1001fps ≈29.97fps, 322프레임, 10.744067초 | 6컷 | 자동재생·무음·반복, playbackRate=1 |
| 상세 첫 히어로 | 1280×720, 30000/1001fps ≈29.97fps, 209프레임, 6.973633초 | 4컷 | 자동재생·무음·반복, playbackRate=1 |

촬영 원본의 프레임레이트, 실제 슬로모션 배율, 편집 프로그램, 카메라 장비는 배포 MP4만으로 확인할 수 없다. 120fps 촬영이나 4배 슬로모션을 사실로 쓰지 않는다. 이전에 확인한 쿠캣1834의 23.976fps·141프레임·5.88초와 이번2094의 규격은 다르다.

## 2. 컷별 분석: 전환과 컷 안의 움직임을 구분한다

프레임은 0부터 세고 범위는 `[시작, 끝)`이다. 시간은 첫 프레임 기준이며 마지막 값은 다음 컷 시작/파일 끝이다. 두 영상의 처음 네 구간은 같은 촬영 내용과 비슷한 시점을 공유하지만 화면 비율과 마지막 종료 프레임은 다르다.

### 상세 히어로 4컷

| 컷·시간·프레임 | 음식/도구의 움직임 | 카메라·화면 구도의 변화 | 다음 컷으로 넘어가는 방식 |
|---|---|---|---|
| H1 · 0–1.668초 · [0,50), 50f | 냄비에서 국물이 실제로 끓는다. 고기 더미는 대체로 제자리에 있고 주변 국물에서 서로 다른 기포가 생겼다 사라진다. | 위에서 비스듬히 내려다보는 전체 냄비. 거의 고정된 구도이며 작은 드리프트/화면 크기 차이가 보인다. 이를 명확한 줌이나 푸시인으로 확정하지 않는다. | f49→50 직접 하드컷. 같은 냄비의 국자 장면으로 각도·거리·동작을 바꾼다. 디졸브/줌 블러 없음. |
| H2 · 1.668–3.504초 · [50,105), 55f | 고기·채소를 담은 국자가 국물 가까이에서 위로 올라온다. 초반 상승이 더 크고 후반에는 상대적으로 안정된다. 아래 국물의 끓음은 계속되고 국자 아래에서 소량의 액체가 빠지는 모습도 보인다. 이 잔류 액체 연출은 동화가든에 복제하지 않는다. | 국자를 따라 위쪽으로 구도가 이동한다. 배경 접시와 냄비가 화면 아래로 내려가므로 음식만 움직이는 완전 고정샷과 다르다. 국자의 접근/상승과 화면 따라가기를 구분한다. | f104→105 하드컷. 냄비에서 검은 면 그릇으로 장면 전환. 국자라는 도구는 이어지지만 연속 동작이 매끄럽게 이어진 매치컷이라고 단정하지 않는다. |
| H3 · 3.504–5.172초 · [105,155), 50f | 큰 국자를 기울여 면 위에 국물과 고기·채소를 붓는다. 액체가 먼저 흐르고 고형물이 중력에 따라 무너져 내려 쌓인다. | 사선 위에서 그릇·면·국자를 함께 보여주는 넓은 구도. 주요 운동은 국자의 회전과 음식의 낙하이며 큰 카메라 이동은 눈에 띄지 않는다. | f154→155 하드컷으로 더 가까운 붓기 장면에 들어간다. 시간/앵글을 압축한 커트인 성격이며, 프레임 사이 연속 줌 효과는 아니다. |
| H4 · 5.172–6.974초 · [155,209), 54f | 이미 건더기가 쌓인 음식에 국물이 부어진다. 국자 위치가 바뀌고 액면이 높아지며 일부 재료가 실제 흐름에 따라 이동한다. | 그릇 내부를 크게 보여주는 근접 구도. 국물 줄기와 건더기가 주목점이다. 움직이는 국자와 흐름이 주가 되며 큰 화면 이동은 없다. | 끝 f208→처음 f0에서 루프 점프. 그릇에서 냄비로 돌아가는 장면 전환이므로 매끄러운 물리적 루프가 아니다. |

### 상단 대표영상 6컷

| 컷 | 시간·프레임 | 동작·프레이밍·전환 |
|---|---|---|
| R1 | 0–1.668초 · [0,50) | H1과 같은 끓는 냄비를 정사각형에 가깝게 크롭해 더 크게 보여준다. 구도는 거의 고정, 작은 프레이밍 변화만 보인다. R2로 하드컷. |
| R2 | 1.668–3.504초 · [50,105) | 국자 상승과 위쪽 따라가기. 정사각 크롭 때문에 국자 속 재료가 더 크게 차지한다. R3로 하드컷. |
| R3 | 3.504–5.172초 · [105,155) | 면 위로 국물·건더기를 붓는 넓은 동작. 국자의 기울기와 낙하가 중심. R4로 하드컷. |
| R4 | 5.172–7.007초 · [155,210) | 더 가까운 붓기. 국물의 양과 액면 변화를 보여준다. f209→210에서 젓가락 비비기로 하드컷. |
| R5 | 7.007–8.742초 · [210,262), 52f | 한 손은 그릇을 지지하고 젓가락은 면을 들어 접고 비빈다. 순환하는 면과 국물의 움직임이 중심이며 구도는 비교적 안정적이다. f261→262에서 손/각도/거리 바뀌는 하드컷. |
| R6 | 8.742–10.744초 · [262,322), 60f | 젓가락이 고기와 면을 위로 들어 올린다. 면은 아래 음식에 이어져 늘어지고 중력 방향이 유지된다. 배경은 대체로 안정적이고 음식 상승이 화면을 채운다. 마지막에서 냄비 첫 컷으로 직접 루프 점프. |

### 이 분석에서 가져갈 편집 문법

1. **컷 간 전환은 모두 하드컷**이다. 경계에 겹침, 디졸브, 방사형 줌 블러, 와이프, 흰 플래시는 확인되지 않았다. 원본 f49–51의 큰 화면 차이를 줌 트랜지션으로 오판하지 않는다.
2. 변화는 전환 효과가 아니라 **전체→국자→넓은 붓기→가까운 붓기**, 대표영상에서는 **비비기→한입 리프트**까지 이어지는 동작·거리·시점에서 나온다.
3. 국자 컷의 위쪽 따라가기는 컷 내부의 프레이밍 움직임이다. 다른 컷에 같은 카메라 움직임을 일괄 적용하지 않는다.
4. 국자 상승은 초반에 더 크고 후반에 덜 움직인다. 이는 보이는 속도 변화다. 실제 손 동작의 감속인지 편집 속도 램프인지는 불명이다. 모든 컷에 임의 배속을 걸 근거가 아니다.
5. 이 레퍼런스의 실사 붓기는 장식용 물방울과 다르다. **동화가든의 물방울 연출 금지를 해제하는 근거가 아니다.** 현재42번의 추가 끓음·김·기포·액체 실 금지는 그대로 유지한다.
6. 레퍼런스의 면·차돌·목이버섯·그릇은 쿠캣 상품의 재료와 연출이다. 동화가든 상품에 임의로 옮기지 않는다. 참고하는 것은 동작과 편집 구조다.

## 3. 계속 유지할 공통 기준과 상품별 조건

### 상품 사실과 물성

- 실제 상품 사진, 승인된 시작 이미지와 확인된 구성품을 우선한다. 재료 종류·분량·색·모양·그릇·조리 상태를 임의로 개선하거나 바꾸지 않는다.
- 원본 국물의 색·탁도·유분·부유물·깊이·점도를 유지한다. 모든 국물을 투명한 호박색 젤로도, 일괄적으로 불투명한 퓨레로도 만들지 않는다.
- 순두부는 서로 다른 크기의 부드러운 찢김면·접힘·젖은 잔조각이다. 반복 쌀알·구슬·콜리플라워 입자, 딱딱한 삼각 판·큐브·매끈한 공 형태를 피한다.
- 원본에서 흐릿한 부분을 새 미세 질감으로 채우지 않는다. 표면의 젖은 부분만 자연스럽게 반사하며 모든 식재료를 같은 광택으로 코팅하지 않는다.
- 음식·수저·그릇의 위치와 형태를 프레임 사이에 유지한다. 지지 없는 음식 부유, 도구 변형, 재료 복제·합체·소멸을 허용하지 않는다.

### 액체·열기·접촉: 조건을 먼저 선택

- `HEAT_STATE`: 실제 근거가 있는 simmer / off_heat / cold 중 하나. 현재42번 F 발전 작업은 **off_heat**이며 새 끓음·기포·김·연무·거품을 추가하지 않는다. 다른 상품도 원본에서 확인되지 않은 열기 효과를 자동으로 붙이지 않는다.
- `LIQUID_ACTION`: 기본값 none. 현재 과업에서 명시적으로 허용된 컷만 pour를 선택한다. none은 음식이 굳어 있다는 뜻이 아니며 도구 접촉 부근의 작고 불규칙한 액체 변위는 허용한다.
- 모든 상품에서 장식적인 낙하 방울·매달린 방울·액체 실·튐·기계적인 동심원 파문을 만들지 않는다. “작고 자연스러운 물방울”도 회피 문구로 쓰지 않는다.
- pour가 허용된 경우에는 용기 기울기, 끊기지 않는 주된 흐름, 담긴 양의 감소와 받는 그릇 액면 상승이 일치해야 한다. 얇은 시럽 실이나 공중에 머무는 방울로 바꾸지 않는다. 현재42번의 no-pour/no-drop 조건은 이 옵션보다 우선한다.
- 젓기는 수저가 이미 액체에 잠긴 시작 이미지에서 짧고 얕은 C형 경로로 설계한다. 리프트는 식재료와 접촉하거나 지지한 상태에서 시작해 낮게 들어 올린다. 공중의 한입을 흔들기만 하는 영상으로 대체하지 않는다.

### 카메라와 전환

- `CAMERA`는 locked / subtle_push_in / upward_follow 등 **실제 확인한 구도 변화**에서 고른다. locked를 쓰는 컷에 카메라 이동 문장을 동시에 넣지 않는다.
- subtle_push_in은 전체 그릇의 비례·재료 수가 변하지 않는 완만한 프레이밍 변화다. upward_follow는 도구 상승을 따라가되 배경이 이유 없이 회전·출렁이지 않아야 한다.
- 효과가 없는 연결도 반드시 `OUT_TRANSITION=hard_cut, duration_frames=0`으로 적는다. 전환란을 빈칸으로 두지 않는다.
- 컷 안의 줌/따라가기와 컷 사이 전환을 별도로 기록한다. 실제 레퍼런스에서 별도 효과가 확인될 때만 그 이름·길이·전후 프레임을 기록해 후반 편집에 적용한다.
- 한 번의 생성에는 한 컷, 한 연속 동작을 맡긴다. **개별 생성 클립 내부에는 컷·디졸브·줌 전환이 없고**, 완성 영상은 편집에서 여러 컷으로 연결한다.

## 4. 작업 전에 반드시 채울 입력표

```yaml
product_no: 실제 상품번호
product_name: 확인한 상품명
product_reference_files: 실제 상품 사진 경로
approved_start_image: 이번 컷의 승인된 시작 이미지 경로
verified_ingredients_and_quantity: 확인한 재료와 분량
texture_and_broth: 원본의 질감, 색, 탁도, 유분, 점도
vessel_and_props: 실제 그릇, 도구, 허용된 주변 물건
heat_state: off_heat | simmer | cold
liquid_action: none | pour
reference_page_and_video: 실제 확인한 URL
reference_shot_and_frames: 해당 컷, 프레임 범위
subject_action: 누가 무엇을 어느 방향으로 움직이는지
start_contact_state: 도구/식재료/액체가 처음에 어떻게 접촉하는지
motion_path_and_tempo: 경로, 시작/중간/끝, 상대적인 속도 변화
camera_and_framing: locked | subtle_push_in | upward_follow 등
camera_evidence: 레퍼런스에서 실제로 본 변화; 촬영방식 추정과 분리
end_state: 다음 컷 전 선택할 끝 자세
out_transition: hard_cut
transition_duration_frames: 0
output_fps_and_aspect: 해당 용도의 확인된 규격
usable_segment_target: 이번 컷에서 필요한 편집 구간 길이
forbidden_changes: 상품별 추가 금지사항
```

정보가 비어 있으면 그 항목을 지어내서 생성하지 않는다. 기존 자료에서 확인하고, 필수 상품 정보가 없으면 해당 컷을 보류한다. 촬영/생성 예산은 별도 승인 범위 안에서만 집행한다.

## 5. 모델에 넣을 공통 본문 — 영어 템플릿

아래 대괄호를 입력표로 치환한다. 모델이 별도 negative 필드를 지원하지 않으면 제한 문장을 본문 마지막에 넣는다. 지원하지 않는 API 옵션을 만들어 보내지 않는다.

```text
Create one continuous food video shot from the supplied approved start image.
The actual Donghwa Garden product reference is the authority for food identity.
Preserve [VERIFIED_INGREDIENTS_AND_QUANTITY], [VESSEL_AND_PROPS], the original
portion, cooking state, colors, and [TEXTURE_AND_BROTH]. Do not import ingredients,
garnishes, cookware, or serving portions from the motion reference.

START STATE: [START_CONTACT_STATE].
ONE SUBJECT ACTION: [SUBJECT_ACTION].
PATH AND TEMPO: [MOTION_PATH_AND_TEMPO].
END STATE: [END_STATE].
CAMERA AND FRAMING: [CAMERA_AND_FRAMING].
HEAT STATE: [HEAT_STATE].
AUTHORIZED LIQUID ACTION: [LIQUID_ACTION].

Except during an explicitly authorized pour, keep food supported by the utensil,
vessel, or surrounding food. During an authorized pour, allow a coherent
gravity-driven descent into the receiving dish; never suspend food in mid-air.
Movement must follow contact, gravity, and the stated action. Ingredients outside
the contact area remain stable except for physically caused local displacement
or reference-supported heat-driven convection. Preserve
irregular food edges and the original amount of detail; do not invent fine texture
in soft or out-of-focus areas. Keep the original broth opacity, viscosity, suspended
seasoning, and restrained wet reflections. Preserve coherent focus and lighting.

No ingredient duplication, morphing, floating food, tool deformation, texture
crawl, repeated granular patterns, uniform plastic gloss, or unexplained background
motion. No decorative droplets, hanging drops, liquid threads, splashes, or geometric
ripple rings. No added heat effects unless the specified heat state and the product
reference support them. [PRODUCT_SPECIFIC_FORBIDDEN_CHANGES].

This is a single shot. No internal cuts, dissolves, wipes, flashes, or transition
zooms. Do not generate an entire montage. The outgoing transition is an editing
instruction handled separately, not an effect inside this generated clip.
```

### 동작 모듈 — 해당 컷 하나만 선택

- **상태/질감:** 실제로 끓는 참고가 있는 뜨거운 음식만 불규칙하고 국소적인 끓음을 허용한다. off_heat 상품에는 끓음 대신 이미 존재하는 음식 표면과 실제 도구 접촉을 보여준다. 임의로 김을 생성해 정지화면을 움직이는 척하지 않는다.
- **잠긴 젓기:** `The spoon starts partly submerged. Make one shallow C-shaped sweep while the bowl of the spoon remains below the liquid surface. Small nearby ingredients yield to the spoon; do not lift a loaded serving or withdraw the spoon into the air.`
- **낮은 리프트:** `Start with the utensil supporting food close to the dish. Lift the same small serving just above the surface, then settle into a brief stable position. Keep the food supported and the surrounding portion consistent. Do not add dripping, stretching liquid, or detached particles.`
- **위쪽 따라가기:** 리프트 동작에 필요할 때만 `Follow the rising utensil upward with a small coherent reframing, keeping it readable while the background shifts downward naturally. Do not orbit, roll, or zoom through the food.`를 추가한다. locked 컷에는 넣지 않는다.
- **붓기:** 허용된 경우만 `Tilt the source vessel once. Let the permitted liquid and solids move downward under gravity in the verified viscosity. The source empties as the receiving dish fills; keep both vessels and the food quantities consistent. No slow-motion droplet display or syrup-like liquid strings.`
- **비비기/섞기:** 실제로 면이나 해당 식재료가 있는 상품만 적용한다. 도구의 잡는 위치와 그릇 지지를 명시하고 반복 원운동 대신 한 번의 짧은 들어 접기/섞기를 사용한다.

두유·김치·고추지·강된장 등에 국물/순두부/면 동작을 일괄 적용하지 않는다. 동일한 입력표와 검수 체계를 쓰되 액체의 농도, 고형물의 변형, 도구와 동작은 실제 상품에 맞춘다.

## 6. 편집 지시서는 생성 프롬프트와 별도로 만든다

```text
Shot ID | Source clip | Clean source [in,out) frames | Output duration |
Subject action | Camera/framing | Visible tempo change |
Outgoing transition + duration | Next-shot relationship | Rejection notes
```

- 2094 히어로를 기준으로 재현할 때의 관찰값은 50/55/50/54프레임, 29.97fps, 4컷이다. 대표영상은 50/55/50/55/52/60프레임, 6컷이다. 이를 모든 동화가든 상품의 고정 처방으로 만들지 않는다.
- 컷의 기능과 동작을 먼저 맞추고, 생성 결과에서 깨끗한 연속 구간을 골라 길이를 정한다. 모델 최소 생성 길이를 완성 영상의 컷 길이로 착각하지 않는다.
- 속도 변경이 필요하면 원본 fps, 선택 구간, 최종 fps, 적용 배율과 이유를 기록한다. 원본에 없는 속도 램프·120fps 보간·역재생·긴 정지 홀드를 자동 적용하지 않는다.
- 음식이 움직인다고 반드시 줌을 더하지 않는다. 가까운 컷으로 하드컷하는 것과 연속 확대를 구분한다.
- 루프 연결도 검수한다. 새 접촉/변형을 만들기 위해 역재생하지 않는다. 이 레퍼런스처럼 마지막→첫 컷의 직접 전환을 선택할 수 있으나 자연스러운 무봉합 루프라고 부르지 않는다.
- 실제 상세에는 MP4의 autoplay/muted/loop/playsinline을 사용한다. 기본 playbackRate는1이며 생성/편집으로 정한 타이밍을 유지한다. GIF/WebP로 대체하지 않는다.

## 7. 검수와 합격 조건

1. 시작 이미지: 실제 상품과 재료·분량·그릇·질감·국물 상태를 대조한다. 시작 이미지가 잘못됐으면 영상 프롬프트로 감추지 않는다.
2. 동작: 원속도와0.5배속으로 전체를 본다. 시작 접촉→움직임→끝 상태가 읽히는지 확인한다.
3. 프레임: 의심 구간과 컷 양쪽을 확인한다. 재료/도구 변형, 추가 재료, 근거 없는 음식 부유, 금지 방울·액체 실은 **사용 구간에 한 프레임이라도 있으면 탈락**이다.
4. 화면: 실제 상세 표시 크기와 모바일에서 질감 과선명, 어색한 반복, 초점 불안정, 전환 충격을 확인한다.
5. 비교: 기존안보다 어떤 항목이 개선됐는지 같은 장면·같은 크기로 비교한다. 다른 구도라는 이유만으로 개선이라 하지 않는다.
6. 상태: 시작 이미지 통과 / 원본 클립 검수 / 선택 구간 통과 / 편집본 검수 / 게시 완료 / 사용자 승인을 따로 기록한다. 현재42번 F는 비교 후보이며 완전한 실사 승인본이 아니다.

## 8. 이전 규칙과의 연결·우선순위

최신 사용자 지시 → 실제 상품 근거 → 현재 선택한 레퍼런스 관찰 → 이 파일의 기본값 → 과거 프롬프트 순서로 적용한다.

- `jjamppong-hero-multicut-20261029/LATEST_USER_STEERING.md`: 실제 상품 물성, 순두부 질감, 과한 연출 제거.
- `jjamppong-hero-multicut-20261029/GENERATION_GUIDELINES.md`: 접촉 상태와 경로로 액체 실을 예방하고 컷별 생성·편집을 분리.
- `jjamppong-hero-multicut-20261029/SHOT_PLAN.md`: 레퍼런스의 실제 동작을 기준으로 구성.
- `hero-revision-20261029/prompts/product-42-attempt-1.txt`: 투명한 국물·과장된 음식 스타일링 교정.
- `hero-motion-development-20261029/prompts/shot01-place-v5-attempt1.txt`, `shot03-lift-v5-attempt2.txt`: 물성·과선명 입자·각진 두부 실패를 함께 방지.
- `hero-motion-development-20261029/qa/video-shot01.json`, `video-shot02-independent.json`, `shot03-v5-independent/decision.json`: 금지 효과가 없는 선택 구간만 사용; 새 영상이라는 이유로 기존의 더 나은 컷을 버리지 않음.
- `thumbnail-generation-20261028/research/ai-food-photo-rules-20261028.md`: 실제 음식의 불규칙성과 원본 디테일 보존. 특정 조명·구도를 모든 새 영상에 강제하는 용도가 아님.

폐기/제한: 장식적인 작은 방울·희미한 김 허용, 전체 편집 영상에 대한 무조건 No cuts, 모든 상품에 손 없음, 1834의34+63+44프레임을 공통으로 고정, GIF/WebP 게시, 확인 없는120fps 주장. **개별 생성 컷의 연속성**과 **완성 영상의 다중 컷 편집**은 양립한다.

GitHub에는 이 문서·코드·프롬프트·텍스트 검수 기록만 남긴다. 미디어는 기존 iCloud 프로젝트에서 관리한다. 이 문서 작성은 추가 유료 생성이나 실서버 변경을 승인하는 행위가 아니다.
