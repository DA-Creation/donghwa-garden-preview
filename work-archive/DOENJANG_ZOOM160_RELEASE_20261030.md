# 된장찌개 히어로 줌·160% 배속 편집 기록 — 2026-10-30

상품32: 안송자 소고기 우거지 된장찌개.

배포 상태: `pending_video_hosting_confirmation`. **공개 상세페이지 배포는 아직 하지 않았다.** 로컬 영상 편집과 파일 검수는 완료했으며, 사용자의 영상 호스팅 선택 답변을 기다린다.

## 요청과 편집 결과

기존 4컷 히어로에 줌인·줌아웃과 160% 배속을 적용하라는 사용자 요청에 따른 후반 편집이다. 공통 프롬프트의 기본 고정 카메라 원칙보다 이번 명시 요청이 우선한다. 쿠캣 레퍼런스에서 확인한 4컷·0프레임 하드컷을 유지하고 줌은 이번 요청으로 추가했다.

- 레퍼런스: https://cookatmarket.com/ko/product/detail?product_id=2094
- 출력: 1280×720, H.264/yuv420p, 30000/1001fps(약29.97fps), 126프레임, 4.2042초, 무음, MP4 faststart.
- 속도: 원본6.740067초를1.6배속으로 편집. 컷별 프레임 반올림으로 최종4.2042초이며 브라우저 playbackRate는1이다.
- A: 1.00→1.08 줌인, 출력0–30프레임(31개).
- B: 1.10→1.00 줌아웃, 출력31–65프레임(35개).
- C: 1.00→1.06 줌인, 출력66–93프레임(28개).
- D: 1.08→1.00 줌아웃, 출력94–125프레임(32개).
- 하드컷 경계: 1.0343666667초, 2.2022초, 3.1364666667초.
- 이번 추가 생성 비용: **USD0**. 새 유료 모델 호출 없이 기존 영상만 편집했다.

## 미디어 경로와 해시

프로젝트 기준 경로: `/Users/dongkeonkim/Library/Mobile Documents/com~apple~CloudDocs/PRINTABLE 서버/동화가든 홈페이지 및 상세페이지 디자인 시스템 구축`

| 구분 | 프로젝트 상대 경로 | SHA256 |
|---|---|---|
| 기존 편집 원본 | `doenjang-hero-video-20261030/outputs/32-doenjang-hero-v1.mp4` | `465279b7c5f26e355b30a001aa1b75d38c8538e90641079aef39333fcd5bf59a` |
| 새 편집 영상 | `doenjang-hero-video-20261030/release-zoom160/32-doenjang-hero-zoom160-v1.mp4` | `24cfd2eccbeff05ec07dac68b4a162f2eac157897f753e454d3b07c2ebb90a65` |

새 영상 파일 크기: 2,612,546bytes. 미디어는 로컬 iCloud에만 있으며 이 문서에 파일 데이터나 base64를 포함하지 않는다. 썸네일·다른 상품·기존 공개 영상은 이번 준비 단계에서 변경하지 않았다.

## QA 근거와 한계

- `doenjang-hero-video-20261030/qa/zoom160/metadata.json`: 전체 디코드 성공, 오류0,126프레임,4.2042초, 무음, 일정한PTS간격.
- `doenjang-hero-video-20261030/qa/zoom160/scene-candidates.json`: 경계31/66/94프레임과 대응하는3회 장면 전환.
- `doenjang-hero-video-20261030/qa/zoom160/overview-4fps-480wide.jpg`: 전체 편집 흐름 검토용.
- `doenjang-hero-video-20261030/qa/zoom160/every-frame-sheets/frames-000000-000035.jpg`
- `doenjang-hero-video-20261030/qa/zoom160/every-frame-sheets/frames-000036-000071.jpg`
- `doenjang-hero-video-20261030/qa/zoom160/every-frame-sheets/frames-000072-000107.jpg`
- `doenjang-hero-video-20261030/qa/zoom160/every-frame-sheets/frames-000108-000125.jpg`

126프레임을 연속 시트로 검토했다. A/C의 확대와 B/D의 축소 방향을 확인했고, 검은 테두리·핵심 음식/국자의 잘림·급격한 구도 변화는 발견하지 않았다. A 끝 냄비손잡이와 C 그릇 하단 일부 크롭은 클로즈업 범위에 포함된다. 별도 framemd5 점검의 연속 동일 디코드 프레임은0개였다. 시트 검토는 실제 휴대폰 재생 검증과 구분한다.

원본 D컷의 국물 광택과 강하게 보이는 입자는 남는다. 줌과 배속으로 AI 질감이 제거됐거나 실사와 같아졌다는 판정은 하지 않는다. 공개 서버/실제 휴대폰 검증은 아직 수행되지 않았다.

## 배포 보류 사유

Cafe24 쇼핑몰 FTP에는 MP4 업로드가 지원되지 않는다. 근거: https://support.cafe24.com/hc/ko/articles/17460428614041

기존 공개 영상은 GitHub 미디어 호스팅을 사용하고 있지만, 사용자가 새 미디어를 GitHub에 올리지 말라고 지시했다. 따라서 새 영상은 업로드하지 않았으며 기존 외부 영상 호스팅 사용, 이 영상만 기존 호스팅에 올리는 예외, 새 호스팅 선택 중 사용자의 답변을 기다린다. 시간 경과를 승인으로 간주하지 않는다. 이 문서와 코드·기록만 텍스트 아카이브 대상으로 준비한다.

읽기 전용 원격 확인 당시 GitHub main: `b3f47d57504d10624701b817a1f554e8c538ccc2`. 이 문서를 준비하면서 GitHub에 쓰거나 다른 원격 변경을 덮어쓰지 않았다.

## 재현용 전체 코드: build_zoom160.py

ffmpeg/ffprobe 경로는 이 컴퓨터의 `/opt/homebrew/bin/`이다. 다른 컴퓨터에서는 이 두 경로와 로컬 원본 파일 유무를 먼저 확인한다. 고정밀 time base와 PTS, 마지막 반올림 보충, 프레임 상한으로 EOF 이후 프레임이 반복되는 문제를 방지했다. 광학흐름 보간은 사용하지 않았다.

```python
#!/usr/bin/env python3
"""User-requested alternating zooms and 160% speed, baked into the MP4."""
from pathlib import Path
import json, subprocess, hashlib, tempfile, shutil
ROOT = Path(__file__).resolve().parent
FFMPEG = "/opt/homebrew/bin/ffmpeg"
FFPROBE = "/opt/homebrew/bin/ffprobe"
RATE = 30000/1001
SPEED = 1.6
SOURCE = ROOT/"outputs/32-doenjang-hero-v1.mp4"
OUT = ROOT/"release-zoom160"
SHOTS = [
    {"key":"A","frames":[0,50],"zoom":[1.0,1.08],"anchor":[.50,.48]},
    {"key":"B","frames":[50,105],"zoom":[1.10,1.0],"anchor":[.64,.41]},
    {"key":"C","frames":[105,150],"zoom":[1.0,1.06],"anchor":[.65,.60]},
    {"key":"D","frames":[150,202],"zoom":[1.08,1.0],"anchor":[.55,.57]},
]
def run(args): subprocess.run(args,check=True)
def probe(path):
    return json.loads(subprocess.check_output([FFPROBE,"-v","error","-count_frames","-show_streams","-show_format","-of","json",str(path)]))
def main():
    OUT.mkdir(exist_ok=True)
    tmp=Path(tempfile.mkdtemp(prefix="donghwa32-zoom160-"))
    timeline=[]
    total=0
    for shot in SHOTS:
        a,b=shot["frames"]; z0,z1=shot["zoom"]; cx,cy=shot["anchor"]
        target_frames=round(b/SPEED)-round(a/SPEED)
        # 3x working raster reduces integer crop stepping; no optical-flow frames.
        z=f"{z0}+({z1-z0})*on/{b-a-1}"
        vf=(f"trim=start_frame={a}:end_frame={b},setpts=PTS-STARTPTS,"
            "scale=3840:2160:flags=lanczos,"
            f"zoompan=z='{z}':x='(iw-iw/zoom)*{cx}':y='(ih-ih/zoom)*{cy}':"
            "d=1:s=1280x720:fps=30000/1001,"
            "settb=1/30000,setpts=N*1001/1.6,fps=30000/1001,"
            f"tpad=stop_mode=clone:stop_duration=0.07,trim=end_frame={target_frames},"
            "setsar=1,format=yuv420p")
        dest=tmp/f'{shot["key"]}.mp4'
        run([FFMPEG,"-hide_banner","-loglevel","error","-y","-i",str(SOURCE),
             "-vf",vf,"-frames:v",str(target_frames),"-an","-c:v","libx264","-preset","medium","-crf","18",
             "-movflags","+faststart",str(dest)])
        info=probe(dest); stream=info["streams"][0];n=int(stream["nb_read_frames"])
        assert n==target_frames, (shot["key"],n,target_frames)
        assert abs(float(info["format"]["duration"])-target_frames/RATE)<.002
        print('Rendered',shot['key'],n,'frames',flush=True)
        timeline.append({**shot,"output_frames":n,"start_frame":total,"end_frame_exclusive":total+n,
                         "start_seconds":total/RATE,"end_seconds":(total+n)/RATE})
        total+=n
    (tmp/"concat.txt").write_text("".join(f"file '{s['key']}.mp4'\n" for s in SHOTS))
    output=tmp/"32-doenjang-hero-zoom160-v1.mp4"
    run([FFMPEG,"-hide_banner","-loglevel","error","-y","-f","concat","-safe","1",
         "-i",str(tmp/"concat.txt"),"-c","copy","-an","-movflags","+faststart",str(output)])
    run([FFMPEG,"-hide_banner","-loglevel","error","-i",str(output),"-f","null","-"])
    info=probe(output);stream=info["streams"][0]
    assert len(info["streams"])==1 and stream["codec_type"]=="video"
    assert stream["width"]==1280 and stream["height"]==720 and stream["pix_fmt"]=="yuv420p"
    assert int(stream["nb_read_frames"])==total and stream["avg_frame_rate"]=="30000/1001"
    assert total==126 and abs(float(info["format"]["duration"])-4.2042)<.002
    final=OUT/output.name;shutil.copy2(output,final)
    poster=OUT/"32-doenjang-hero-zoom160-poster.jpg"
    run([FFMPEG,"-hide_banner","-loglevel","error","-y","-i",str(output),"-frames:v","1","-q:v","2",str(poster)])
    result={"file":str(final.relative_to(ROOT)),"source":str(SOURCE.relative_to(ROOT)),
            "source_sha256":hashlib.sha256(SOURCE.read_bytes()).hexdigest(),"speed":SPEED,
            "zoom_scope":"User-requested post-production camera crop; original hard cuts retained",
            "width":1280,"height":720,"fps":"30000/1001","frames":total,
            "duration_seconds":float(info["format"]["duration"]),"audio":False,
            "bytes":final.stat().st_size,"sha256":hashlib.sha256(final.read_bytes()).hexdigest(),
            "timeline":timeline,"browser_playback_rate":1,"additional_generation_cost_usd":0}
    (OUT/"edit-manifest.json").write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n")
    shutil.rmtree(tmp)
    print(json.dumps(result,ensure_ascii=False))
if __name__=="__main__":main()
```

## edit-manifest.json

```json
{
  "file": "release-zoom160/32-doenjang-hero-zoom160-v1.mp4",
  "source": "outputs/32-doenjang-hero-v1.mp4",
  "source_sha256": "465279b7c5f26e355b30a001aa1b75d38c8538e90641079aef39333fcd5bf59a",
  "speed": 1.6,
  "zoom_scope": "User-requested post-production camera crop; original hard cuts retained",
  "width": 1280,
  "height": 720,
  "fps": "30000/1001",
  "frames": 126,
  "duration_seconds": 4.2042,
  "audio": false,
  "bytes": 2612546,
  "sha256": "24cfd2eccbeff05ec07dac68b4a162f2eac157897f753e454d3b07c2ebb90a65",
  "timeline": [
    {
      "key": "A",
      "frames": [
        0,
        50
      ],
      "zoom": [
        1.0,
        1.08
      ],
      "anchor": [
        0.5,
        0.48
      ],
      "output_frames": 31,
      "start_frame": 0,
      "end_frame_exclusive": 31,
      "start_seconds": 0.0,
      "end_seconds": 1.0343666666666667
    },
    {
      "key": "B",
      "frames": [
        50,
        105
      ],
      "zoom": [
        1.1,
        1.0
      ],
      "anchor": [
        0.64,
        0.41
      ],
      "output_frames": 35,
      "start_frame": 31,
      "end_frame_exclusive": 66,
      "start_seconds": 1.0343666666666667,
      "end_seconds": 2.2022
    },
    {
      "key": "C",
      "frames": [
        105,
        150
      ],
      "zoom": [
        1.0,
        1.06
      ],
      "anchor": [
        0.65,
        0.6
      ],
      "output_frames": 28,
      "start_frame": 66,
      "end_frame_exclusive": 94,
      "start_seconds": 2.2022,
      "end_seconds": 3.1364666666666667
    },
    {
      "key": "D",
      "frames": [
        150,
        202
      ],
      "zoom": [
        1.08,
        1.0
      ],
      "anchor": [
        0.55,
        0.57
      ],
      "output_frames": 32,
      "start_frame": 94,
      "end_frame_exclusive": 126,
      "start_seconds": 3.1364666666666667,
      "end_seconds": 4.2042
    }
  ],
  "browser_playback_rate": 1,
  "additional_generation_cost_usd": 0
}
```
