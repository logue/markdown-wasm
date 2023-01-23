#!/bin/sh
cd src
emcc \
  wlib.c wbuf.c md.c md4c.c fmt_html.c \
  -s WASM=1 \
  -s NO_EXIT_RUNTIME=1 \
  -s NO_FILESYSTEM=1 \
  -s ABORTING_MALLOC=0 \
  -s ALLOW_MEMORY_GROWTH=1 \
  -s EXPORTED_RUNTIME_METHODS=addFunction,removeFunction,addOnPostRun \
  -s RESERVED_FUNCTION_POINTERS=1 \
  -s DISABLE_EXCEPTION_CATCHING=1 \
  -s MODULARIZE=1 \
  -s EXPORT_ES6=1 \
  --source-map-base \
  --closure=0 \
  --minify=0 \
  -Oz \
  -DMD4C_USE_UTF8 \
  -o markdown.js
