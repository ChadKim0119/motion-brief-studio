# Motion Brief Studio — 작업 규칙

- 답변과 진행 안내는 한국어로.
- 소스는 `src/`에서만 고친다. `dist/index.html`은 `./scripts/build.sh`로만 만든다 (직접 편집 금지).
- 디자인은 `DESIGN.md`의 getdesign Apple 시스템을 따른다. 액션 블루·중립 표면·시스템 글꼴·알약형 CTA를 사용하고, 기존 `ms-` 토큰 이름은 호환용으로 유지한다. 라이트 작업 화면과 다크 헤더를 사용하며, 영상 안의 스타일은 프로젝트 설정을 따른다.
- 게시: 빌드한 `dist/index.html`을 claude.ai 아티팩트 https://claude.ai/artifact/5sGf9oU1QE3MCYjQEr2eaE 에 같은 URL로 다시 게시한다. `files`로 `fonts/PretendardVariable.woff2`(← `dist/fonts/`)를 함께 올리고, capabilities는 생략해 기존 선언(db, user, assets, sample, downloads)을 유지한다.
- 웹 배포: Vercel(https://motion-brief-studio.vercel.app)이 `main` 푸시마다 `scripts/build.sh`를 돌려 `web/index.html`(doctype·charset을 갖춘 완전한 문서)을 서비스한다(`vercel.json`). `web/`은 커밋하지 않는다. 아티팩트 밖에서는 claude.ai 기능이 없어 로컬 모드(브라우저 저장, Claude 호출 없음)로 동작한다.
- 툴을 고칠 때마다 `src/`와 `dist/`를 함께 커밋하고 `main`에 푸시한다. 커밋 메시지는 한국어로, 무엇을 왜 바꿨는지 적는다.
- 데이터 경로(`projects/{id}`, `drafts/{id}`, `projects/{id}/versions/{vid}`)와 `motion-brief/1` 형식(`docs/motion-brief-format.md`)은 기존 프로젝트·버전과 호환되게 유지한다. 형식을 바꾸면 문서도 함께 고친다.
