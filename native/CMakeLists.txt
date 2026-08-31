cmake_minimum_required(VERSION 3.12)
project(markdown_wasm LANGUAGES C)

# 生成物は src/index.ts が参照している src-wasm 配下へ出力する
set(OUTPUT_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../src/generated")
file(MAKE_DIRECTORY "${OUTPUT_DIR}")

add_executable(markdown
    src/wlib.c
    src/wbuf.c
    src/md.c
    src/md4c.c
    src/fmt_html.c
    src/entity.c
)

set_target_properties(markdown PROPERTIES
    OUTPUT_NAME "markdown"
    SUFFIX ".js"
    RUNTIME_OUTPUT_DIRECTORY "${OUTPUT_DIR}"
)

target_compile_definitions(markdown PRIVATE MD4C_USE_UTF8)
target_compile_options(markdown PRIVATE
    --closure 1
    --no-entry
    -flto
    -fno-exceptions
    -O3
)

target_link_options(markdown PRIVATE
    --closure 1
    --no-entry
    -flto
    -O3
    "-sALLOW_MEMORY_GROWTH=1"
    "-sALLOW_TABLE_GROWTH=1"
    "-sASSERTIONS=0"
    "-sAUTO_NATIVE_LIBRARIES=0"
    "-sENVIRONMENT=web,node"
    "-sERROR_ON_UNDEFINED_SYMBOLS"
    "-sEXPORT_ALL=1"
    "-sEXPORT_ES6=1"
    "-sEXPORTED_RUNTIME_METHODS=addFunction,removeFunction,addOnPostRun,UTF8ArrayToString"
    "-sINCOMING_MODULE_JS_API=[]"
    "-sFILESYSTEM=0"
    "-sMALLOC=emmalloc"
    "-sMODULARIZE=1"
    "-sNO_EXIT_RUNTIME=1"
    "-sSTRICT=0"
    "-sWASM=1"
)

# Vite で node:module を静的 import として扱わせないためのパッチ
# sed の BSD/GNU 差異を避けるため Python で安全に置換する
add_custom_command(TARGET markdown POST_BUILD
    COMMAND python3 -c "from pathlib import Path; p = Path(r'${OUTPUT_DIR}/markdown.js'); s = p.read_text(); s = s.replace('await import(\"node:module\")', 'await import(/* @vite-ignore */(\"node:\"+\"module\"))'); p.write_text(s)"
    COMMENT "Vite 向けに node:module import を @vite-ignore 付きの式へ置換中..."
    VERBATIM
)
