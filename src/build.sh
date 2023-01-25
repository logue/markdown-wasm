#!/bin/sh
cd src
emcc \
  --closure=1 \
  --no-entry \
  --source-map-base \
  -DMD4C_USE_UTF8 \
  -Oz \
  -lembind \
  -s ALLOW_MEMORY_GROWTH=1 \
  -s ASSERTIONS=0 \
  -s ENVIRONMENT=web,node \
  -s EXPORT_ES6=1 \
  -s EXPORTED_RUNTIME_METHODS=addFunction,removeFunction,addOnPostRun \
  -s FILESYSTEM=0 \
  -s MALLOC=emmalloc \
  -s MODULARIZE=1 \
  -s NO_EXIT_RUNTIME=1 \
  -s STRICT=0 \
  -s WASM=1 \
  -o markdown.js \
  wlib.c wbuf.c md.c md4c.c fmt_html.c
