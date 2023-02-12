#pragma once

#include "md4c.h"

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
