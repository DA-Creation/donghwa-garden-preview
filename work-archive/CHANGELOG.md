# 변경 기록

## 2026-10-30 사용자 지시 변경 — 미디어 업로드 취소

- GitHub는 코드·프롬프트·기록만 보관한다. 이번 자산 폴더는 현재 GitHub 트리에서 제거했고, 로컬 staging의 assets는 형제 `local-only-assets`로 이동해 보존했다. 원본 생성 파일·썸네일 백업은 삭제하지 않았다. 기존 실서버용 MP4 17개는 유지한다.
- 미디어 매핑은 로컬 iCloud 경로·해시 참조로 바꾸었고, 미디어가 없어도 코드 복원이 끝나도록 했다. shallow clone과 이미지·영상 확장자 ignore 규칙을 적용했다. 아래 이전 기록의 “포함”은 당시 준비 상태이며 현재 GitHub 보관 범위는 이 지시를 따른다.

## 2026-10-30

- 다른 컴퓨터에서 이어받을 수 있도록 상품 미디어 작업을 평탄한 Git 추적 파일과 원래 경로 복원 도구로 구성했다.
- 현재/이전 skin5 공개 상세 원문, 프롬프트와 선별 QA, 상품별 후보/썸네일 상태를 기록했다.
- 15개 상품의 `list_image`, `tiny_image`, `small_image`를 선택한 최신 썸네일로 게시하고 실제 반환 이미지를 검증했다. 38번과 나머지 상품 필드·상세 본문·대표 상세 이미지는 유지했다. Cafe24의 33번 자동 리사이즈는 같은 비율의 256px 비교에서 정규화 RGB 평균 차이 2.5/채널·RMS 5 미만으로 확인했다.
- 공개 마켓의 데스크톱 및 390×844 모바일 뷰포트를 확인하고 두 화면 증거를 보관했다. 별도 GET 검증에서는 교체 이미지 45건과 유지 이미지 19건이 모두 통과했다. 물리 iPhone 검증과는 구분한다.
- 기존 GitHub 저장소에서 clone·복원·수집·검증·커밋·push로 다른 컴퓨터의 작업을 이어갈 절차를 추가했다. 현재 소스 폴더 커밋은 `7dc8107`이다. 나머지 아카이브 업로드 완료는 실제 원격 결과에 따라 기록한다.
- 8940 마켓·8950 히어로의 기존 로컬 검토 UI와 의존 파일, F 조립·프레임 분석 스크립트를 추가했다. 현재 선택 C 이미지 14장은 공개 URL에만 의존하지 않도록 실제 파일로 포함했다. 복원한 환경의 HTTP 경로와 34개 CSS/JS, 선택 썸네일 15개·C 이미지 14개를 확인했고 F 재조립 결과의 SHA256도 현재 배포본과 일치했다.

## 2026-10-29

- 다른 컴퓨터의 짬뽕 E 후보를 보존하며 새 F 비교 후보를 제작했다. AI 질감이 완전히 제거됐다는 판정은 하지 않았다.
- 15상품의 기존 영상 A와 42번 E/F를 실제 MP4 17개로 제공했다. GIF/WebP 대체 배포를 중단했다.
- 쿠캣 상세 첫 영상의 23.976fps·141프레임·5.880875초와 컷 경계를 확인해 F 출력에 맞췄다. 촬영 120fps 여부는 확인되지 않았다.
- 데스크톱 및 390px 모바일 뷰포트에서 자동재생, 무음, 반복, 인라인, 후보 이동과 비활성 영상 정지를 검증했다. 물리 iPhone 테스트와는 구분한다.

## 2026-10-30 — Common food-video prompt

Analyzed Cookat2094's two live MP4s frame by frame: 6-shot representative and4-shot hero,29.97fps; all observed boundaries use hard cuts. Recorded subject motion separately from framing and transitions, and kept capture-rate/retiming uncertainty explicit. Added canonical common prompt, conditional heat/pour rules, per-shot template and editing/QA instructions. No paid generation, storefront changes or media uploads.

## 2026-10-30 — 된장찌개 히어로 시작 이미지4컷

- 실제 상품32 원본과 쿠캣2094의4컷 구성을 대조해 A냄비/B국자/C덜기전/D근접 시작 이미지를 각각 생성했다. 선택본은 A-v1, B-v1, C-v1, D-v3이다.
- D-v1/v2는 반복적인 고기 표면 무늬 때문에 미채택하고 실제 사진을 질감 기준으로 재생성했다. 총6회 내장 이미지 생성이며 Replicate 영상 생성/상세페이지 배포는 하지 않았다.
- 전체 프롬프트6개, 컷 계획, 실제 참조, 선택·제외 이유와 파일 경로/해시를 DOENJANG_HERO_4CUTS_20261030.md에 기록했다. 이미지/영상은 iCloud에만 보관한다.

## 2026-10-30 - Doenjang hero video review draft

- Generated6Seedance2.0 calls at720p/4seconds and1Wan2.5i2v call at720p/5seconds:7calls, estimated USD4.82. B-v1 failed no-drip/low-lift requirements; D-v1/v2 failed low-viscosity soup flow. WanD-v3 replaced D. No further generation calls planned.
- Rendered A[8,48),B-v2[40,84),C[56,92),D-v3-wan[35,77) at native1x into1280x720,30000/1001fps,202frames,6.740067seconds,silent. Internal0framehardcuts occur at1.668333,3.5035,5.005seconds.
- Output:doenjang-hero-video-20261030/outputs/32-doenjang-hero-v1.mp4;3467947bytes;SHA256465279b7c5f26e355b30a001aa1b75d38c8538e90641079aef39333fcd5bf59a. Parent verified full decode/cut boundaries/browser autoplay-loop-muted-1x; final native D QA remains pending.
- All7current prompt sources, negative prompt, failure decisions, settings, edit decision, render summary and complete build_video.py are preserved in DOENJANG_HERO_VIDEO_20261030.md. Initial SHOT_INPUTS.json is explicitly historical, with A's current hash refreshed and execution links added.
- Some start-image gloss/beef texture remains; B uses a low supported hold instead of a rise. Review draft only; storefront not deployed. Existing still archive preserved; no media/base64/account balances or archive upload by preparer. GitHub connector read still requires reauthentication.

## 2026-10-30 — 된장찌개 줌·160% 배속 편집

- 사용자 요청으로 기존4컷에 A/C 줌인·B/D 줌아웃과1.6배속을 적용했다. 4.2042초·126프레임·29.97fps·무음 MP4이며 하드컷을 유지한다. 새 유료 생성 비용은 USD0이다.
- 전체 디코드와126프레임 시트 검토를 마쳤다. 검은 테두리나 핵심 피사체 잘림은 발견하지 않았고, 원본 D의 국물 광택·입자 표현은 남는다. 실제 휴대폰 재생 검증과는 구분한다.
- 상태는 `pending_video_hosting_confirmation`이다. Cafe24 쇼핑 FTP의 MP4 미지원 및 새 GitHub 미디어 업로드 금지 지침 때문에 호스팅 선택 답변을 기다리며 아직 공개 배포하지 않았다.
- 전체 편집 코드, edit-manifest JSON, 원본/출력 경로·해시와 QA 근거를 DOENJANG_ZOOM160_RELEASE_20261030.md에 보관한다. 미디어/base64/인증정보는 포함하지 않는다.
