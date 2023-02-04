#pragma once

typedef struct FmtHTML
{
  OutputFlags flags;
  u32 parserFlags; // passed along to md_parse
  WBuf *outbuf;

  // optional callbacks
  JSTextFilterFun onCodeBlock;

  // internal state
  int image_nesting_level;
  int addanchor;
  int codeBlockNest;

  char escape_map[256];

  WBuf tmpbuf;
} FmtHTML;

int fmt_html(const char *input, u32 inputlen, FmtHTML *fmt);
