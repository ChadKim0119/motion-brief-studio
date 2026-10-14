#!/usr/bin/env bash
# src/ 조각을 합쳐 두 가지 결과물을 만든다.
#  - dist/index.html : claude.ai 아티팩트 게시용 (게시 도구가 doctype·head를 씌우므로 본문 조각만)
#  - web/index.html  : Vercel 등 일반 웹 호스팅용 (doctype·charset·viewport를 갖춘 완전한 문서)
set -euo pipefail
cd "$(dirname "$0")/.."
cat src/03_core.js src/04_views.js src/05_edit.js src/06_render.js src/07_export.js src/08_overlays.js src/09_actions.js > dist/app.js
node --check dist/app.js
{ cat src/01_head.html; cat src/02_shell.html; echo '<script>'; cat dist/app.js; echo '</script>'; } > dist/index.html
rm dist/app.js
echo "built dist/index.html ($(wc -c < dist/index.html) bytes)"

# 웹 호스팅용: 아티팩트 게시 때 붙는 것과 같은 문서 골격으로 감싼다.
rm -rf web && mkdir -p web
cp -R dist/fonts web/fonts
{
  printf '%s' '<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
  printf '%s' '<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>'
  printf '%s' '</head><body>'
  cat dist/index.html
  printf '%s\n' '</body></html>'
} > web/index.html
echo "built web/index.html ($(wc -c < web/index.html) bytes)"
