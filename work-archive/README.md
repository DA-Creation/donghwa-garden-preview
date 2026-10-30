# 동화가든 작업 이어받기 — 코드·프롬프트·기록만 GitHub 보관

사용자 지시에 따라 **실제 이미지·영상·썸네일 원본 백업은 iCloud 로컬에 보관**한다. GitHub `work-archive`에는 코드, 프롬프트, 판단·검증 기록과 파일 경로·해시만 둔다. 이전부터 실제 페이지에 제공하던 MP4 17개는 기존 위치를 유지한다. 이번 아카이브의 미디어 업로드는 취소했고 자산 폴더는 현재 GitHub 트리에서 제거했다.

## 다른 컴퓨터에서 시작

과거 업로드 기록의 불필요한 파일을 받지 않도록 최신 커밋만 받는다.

```sh
git clone --depth 1 https://github.com/DA-Creation/donghwa-garden-preview.git
cd donghwa-garden-preview/work-archive
python3 verify.py
python3 restore.py --output ../../donghwa-work
```

`CURRENT_STATE.json`, `evidence/product-state.json`, `AGENTS.md`부터 읽는다. 미디어가 없어도 코드 복원은 끝난다. 원래 프로젝트 경로는 `file-map.json`에 있다. 현재 공개 상세 소스는 `source/current--`, MP4 전환 전 원본은 `source/before-mp4--`다.

실제 미디어는 iCloud 프로젝트의 `thumbnail-publish-20261030/local-only-assets`에 있다. 이는 staging의 자산 폴더를 이동한 보존본이며 원래 생성 파일과 썸네일 백업도 삭제하지 않았다. 다른 컴퓨터에서 iCloud 동기화가 완료됐다면 해당 경로를 지정해 복원할 수 있다.

```sh
python3 restore.py --output ../../donghwa-work --local-media "/실제/iCloud/프로젝트/thumbnail-publish-20261030/local-only-assets"
```

`thumbnail-assets-map.json`은 로컬 파일명·원래 상대경로·해시를 기록한다. 없는 미디어는 건너뛰며 코드 복원을 막지 않는다. `asset-manifest.json`의 공개 URL은 참고 기록이고 자동 다운로드하지 않는다.

## 로컬 미리보기와 편집

```sh
python3 -m pip install -r ../../donghwa-work/preview-tools/requirements.txt
python3 ../../donghwa-work/thumbnail-generation-20261028/preview/serve_preview.py
```

마켓 주소는 `http://127.0.0.1:8940/mobile.html`이다. 별도 터미널에서 히어로 검토 화면을 실행한다.

```sh
python3 -m http.server 8950 --bind 127.0.0.1 --directory ../../donghwa-work/hero-generation-20261028
```

`http://127.0.0.1:8950/?product=42`는 당시 단일 컷 검토 화면이고 `/review-42.html`, `/review-all.html`은 시작 이미지 비교 화면이다. 최신 F는 실제 배포 상세페이지와 `hero-motion-development-20261029/outputs/42-F-hero-multicut-v5.mp4`로 구분한다. 미디어를 복원하지 않으면 해당 이미지·영상은 보이지 않을 수 있다. 폰트·브랜드 이미지 등 일부 요소는 공개 서버를 참조하며, 과거 8939 상세 서버와 모든 실험 후보를 보관한 전체 사이트 백업은 아니다.

F 조립에는 로컬 첫 컷·마지막 컷과 기존 E 영상, PATH의 `ffmpeg`·`ffprobe`가 필요하다. 기존 E는 원래 iCloud 출력 또는 기존 저장소 `media/hero-review-20261029/42-E-hero-multicut-v4.mp4`에서 `jjamppong-hero-multicut-20261029/outputs/`로 복사하면 된다.

```sh
python3 ../../donghwa-work/hero-motion-development-20261029/build_final.py
```

프레임 분석은 `jjamppong-hero-multicut-20261029/generation/analyze_video.py`, 타이밍 확인은 `qa/encoding-check/inspect_timing.py`를 사용한다. 이 도구는 유료 생성을 실행하지 않는다. 이전 복원 검사에서 F 재조립 SHA256은 배포본과 일치했다. 현재 텍스트 전용 전환 뒤 재촬영·재생성·반복 검증은 하지 않았다.

## 현재 결정과 다음 작업

- 15개 상품의 목록·작은 썸네일만 교체했고 38번과 상세 대표 이미지·본문·가격·판매/진열 등은 유지했다. 교체 CDN 45건과 유지 이미지 19건을 확인했다.
- 42번 F(6/6)는 최신 공개 비교 후보이며 완전한 실사 승인본이 아니다. 미세 순두부 질감과 각진 면 등이 남아 있다. 출력은 141프레임, 1280×720, 23.976fps, 5.880875초다. 120fps 촬영 여부는 확인되지 않았다.
- 36/40번과 41/46번은 각각 상세 템플릿을 공유하므로 `product_no`로 구분한다. 39번은 native 상세 조건부 로더다. 상품을 삭제하지 않는다.
- 실제 상품과 승인한 레퍼런스를 먼저 확인한다. 기존 카피·기능을 임의로 바꾸지 않는다. 42번에 새 김·액체방울·실·기포 등 작위적인 연출을 추가하지 않는다. 남은 생성 예산을 자동 사용하지 않는다.

## 변경 후 GitHub 갱신

아래 명령은 `work-archive`에서 실행한다. `collect.py`는 매핑된 코드·프롬프트·기록만 모은다. 미디어는 iCloud에 남기고 경로·해시만 업데이트한다.

```sh
python3 collect.py --workspace ../../donghwa-work --dry-run
python3 collect.py --workspace ../../donghwa-work
python3 verify.py
git status --short
git add .
git diff --cached --stat
git commit -m "Update Donghwa work code and records"
git push
```

원격이 더 최신이면 변경을 받아 병합하고 재검증한다. 오래된 `hosting-repo`로 강제 푸시하지 않는다. 인증값, 채워진 `.env`, 토큰·SFTP 설정, 비공개 고객 데이터는 GitHub에 올리지 않는다. Cafe24 인증은 각 컴퓨터 로컬에서 설정하며 `source/local-tools--environment.example`은 빈 예시다. 유료 생성과 실서버 배포는 Git 동기화와 별개다.
