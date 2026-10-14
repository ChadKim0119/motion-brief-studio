# Motion Brief Studio — 작업 규칙

- 답변과 진행 안내는 한국어로.
- 소스는 `src/`에서만 고친다. `dist/index.html`은 `./scripts/build.sh`로만 만든다 (직접 편집 금지).
- 게시: 빌드한 `dist/index.html`을 claude.ai 아티팩트 https://claude.ai/artifact/5sGf9oU1QE3MCYjQEr2eaE 에 같은 URL로 다시 게시한다. capabilities는 생략해 기존 선언(db, user, assets, sample, downloads)을 유지한다.
- 툴을 고칠 때마다 `src/`와 `dist/`를 함께 커밋하고 `main`에 푸시한다. 커밋 메시지는 한국어로, 무엇을 왜 바꿨는지 적는다.
- 데이터 경로(`projects/{id}`, `drafts/{id}`, `projects/{id}/versions/{vid}`)와 `motion-brief/1` 형식(`docs/motion-brief-format.md`)은 기존 프로젝트·버전과 호환되게 유지한다. 형식을 바꾸면 문서도 함께 고친다.
