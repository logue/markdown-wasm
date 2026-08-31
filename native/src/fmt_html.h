#pragma once

#include "md4c.h"

/* If set, debug output from md_parse() is sent to stderr. */
#define MD_HTML_FLAG_DEBUG 0x0001
#define MD_HTML_FLAG_VERBATIM_ENTITIES 0x0002
#define MD_HTML_FLAG_SKIP_UTF8_BOM 0x0004
#define MD_HTML_FLAG_XHTML 0x0008

typedef struct FmtHTML
{
    OutputFlags flags;
    u32 parserFlags; // passed along to md_parse
    WBuf *userdata;

    // optional callbacks
    JSTextFilterFun onCodeBlock;

    // internal state
    int image_nesting_level;
    int addanchor;
    int codeBlockNest;

    void (*process_output)(const MD_CHAR *, MD_SIZE, void *);
    char escape_map[256];

    WBuf tmpbuf;
} FmtHTML;

int fmt_html(const MD_CHAR *input, MD_SIZE inputlen, FmtHTML *fmt);
