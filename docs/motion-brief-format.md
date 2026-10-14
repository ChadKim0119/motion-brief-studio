# motion-brief/1 — 제작 안내서 형식

Motion Brief Studio에서 내보낸 `brief.md` / ZIP 패키지를 받아 영상을 만들 때의 규칙입니다.

## 파일 구조
- `brief.md` — YAML front matter + 사람용 본문(개요·사운드·씬 표·씬 상세·자막 타이밍·변경 이력) + 맨 아래 ```` ```json motion-brief ```` 블록(정본)
- ZIP 패키지: `brief.md`, `project.json`, `REQUEST.txt`, `narration_{ko|ja|en}.txt`, `subtitles_{lang}.srt`, `tts_style_instructions.txt`, `bgm_brief.txt`, `thumbnail.png`, `audio/narration.*`, `audio/bgm.*`(선택), `stills/scene-NN.*`, `refs/*`

## 읽는 법
1. JSON 블록이 정본. 본문과 다르면 JSON을 따른다.
2. `timeline.scenes[]` / `timeline.lines[]`의 start/end(초)로 씬·자막 타이밍을 맞춘다. `est: true`인 줄은 오디오 없이 추정한 값.
3. `project.scenes[].dir` = 연출 값: energy 1–5, tone -2~2, pace 1–5, camera(static/zoomIn/zoomOut/push/panL/panR/tilt/orbit), transition(다음 씬으로: cut/dissolve/flash/whip/glitch/wipe/zoom), effects[], textAnim(mask/fadeUp/type/pop), accent.
4. `still.fx/fy` = 카메라 무브 중심점(0–1). 스틸이 없으면 `visual` 설명대로 제작.
5. `locked: true` 씬은 변경 금지. `notes[]` 중 `done: false`는 반드시 반영.
6. `bgm` = 무드(energy/valence 0–1), bpm, genres, instruments, vocals, avoid, duck(dB), fadeIn/Out, source(synth/upload/stock). 씬별 에너지 곡선과 `bgmHit`(씬 시작 임팩트)를 따른다.
7. 자막: `subs.show`, 주 언어 `subs.lang`, 보조 `subs.second`.

## 산출물
- MP4 (front matter의 resolution·fps·duration) + 컨셉 썸네일 PNG

## 돌려줄 때
- 같은 형식의 `brief.md`를 함께 반환. front matter `source: claude-code` 또는 `claude-chat`, `note:`에 바뀐 점, 필요하면 `agent:` `ref:`(repo@commit). 웹툴의 ‘안내서 가져오기’가 이 값을 출처 태그로 기록한다.
