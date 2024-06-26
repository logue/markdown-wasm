cd src
emcc ^
  --closure 1 ^
  --no-entry ^
  -flto ^
  -fno-exceptions ^
  -O3 ^
  -DMD4C_USE_UTF8 ^
  -lembind ^
  -s ALLOW_MEMORY_GROWTH=1 ^
  -s ALLOW_TABLE_GROWTH=1 ^
  -s ASSERTIONS=0 ^
  -s AUTO_NATIVE_LIBRARIES=0 ^
  -s ENVIRONMENT=web ^
  -s ERROR_ON_UNDEFINED_SYMBOLS ^
  -s EXPORT_ES6=1 ^
  -s EXPORTED_RUNTIME_METHODS=addFunction,removeFunction,addOnPostRun,UTF8ArrayToString ^
  -s FILESYSTEM=0 ^
  -s INCOMING_MODULE_JS_API=[] ^
  -s MALLOC=emmalloc ^
  -s MODULARIZE=1 ^
  -s NO_EXIT_RUNTIME=1 ^
  -s STRICT=0 ^
  -s WASM=1 ^
  -Wno-enum-constexpr-conversion ^
  -o markdown.js ^
  wlib.c wbuf.c md.c md4c.c fmt_html.c
