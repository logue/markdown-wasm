#!/bin/sh
cd src
emcc \
  -O3 \
  -lembind \
  -s ALLOW_MEMORY_GROWTH=1 \
  -s EXPORT_ES6=1 \
  -s EXPORTED_RUNTIME_METHODS=addFunction,removeFunction,addOnPostRun  ^
  -s FILESYSTEM=0 \
  -s MALLOC=emmalloc \
  -s NO_EXIT_RUNTIME=1 \
  -s STRICT=0 \
  -s WASM=1 \
  --source-map-base \
  --closure=0 \
  --minify=0 \
  -DMD4C_USE_UTF8 \
  -o markdown.js \
  wlib.c wbuf.c md.c md4c.c fmt_html.c
