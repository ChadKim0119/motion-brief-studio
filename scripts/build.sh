#!/usr/bin/env bash
# src/ 조각을 합쳐 dist/index.html(아티팩트 게시용 단일 파일)을 만든다.
set -euo pipefail
cd "$(dirname "$0")/.."
cat src/03_core.js src/04_views.js src/05_edit.js src/06_render.js src/07_export.js src/08_overlays.js src/09_actions.js > dist/app.js
node --check dist/app.js
{ cat src/01_head.html; cat src/02_shell.html; echo '<script>'; cat dist/app.js; echo '</script>'; } > dist/index.html
rm dist/app.js
echo "built dist/index.html ($(wc -c < dist/index.html) bytes)"
