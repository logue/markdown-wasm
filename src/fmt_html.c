/*
 * md4c modified for mdjs.
 * Original source code is licensed as follows:
 *
 * Copyright (c) 2016-2019 Martin Mitas / 2023 Masashi Yoshikawa
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

#include <stdio.h>
#include <ctype.h>
#include <strings.h>

#include "common.h"
#include "fmt_html.h"
#include "entity.h"

// typedef struct FmtHTML_st {
//   WBuf* outbuf;
//   int   image_nesting_level;
//   int   addanchor;
//   u32   flags;
// } FmtHTML;

#define NEED_HTML_ESC_FLAG 0x1
#define NEED_URL_ESC_FLAG 0x2

/*****************************************
 ***  HTML rendering helper functions  ***
 *****************************************/

#define ISDIGIT(ch) ('0' <= (ch) && (ch) <= '9')
#define ISLOWER(ch) ('a' <= (ch) && (ch) <= 'z')
#define ISUPPER(ch) ('A' <= (ch) && (ch) <= 'Z')
#define ISALNUM(ch) (ISLOWER(ch) || ISUPPER(ch) || ISDIGIT(ch))

static inline void render_verbatim(FmtHTML *r, const MD_CHAR *text, MD_SIZE size)
{
  WBufAppendBytes(r->outbuf, text, size);
}

/* Keep this as a macro. Most compiler should then be smart enough to replace
 * the strlen() call with a compile-time constant if the string is a C literal. */
#define RENDER_VERBATIM(r, verbatim) \
  render_verbatim((r), (verbatim), (MD_SIZE)(strlen(verbatim)))

static void render_html_escaped(FmtHTML *r, const MD_CHAR *data, MD_SIZE size)
{
  MD_OFFSET beg = 0;
  MD_OFFSET off = 0;

/* Some characters need to be escaped in normal HTML text. */
#define NEED_HTML_ESC(ch) (r->escape_map[(unsigned char)(ch)] & NEED_HTML_ESC_FLAG)

  while (1)
  {
    /* Optimization: Use some loop unrolling. */
    while (off + 3 < size && !NEED_HTML_ESC(data[off + 0]) && !NEED_HTML_ESC(data[off + 1]) && !NEED_HTML_ESC(data[off + 2]) && !NEED_HTML_ESC(data[off + 3]))
      off += 4;
    while (off < size && !NEED_HTML_ESC(data[off]))
      off++;

    if (off > beg)
      render_verbatim(r, data + beg, off - beg);

    if (off < size)
    {
      switch (data[off])
      {
      case '&':
        RENDER_VERBATIM(r, "&amp;");
        break;
      case '<':
        RENDER_VERBATIM(r, "&lt;");
        break;
      case '>':
        RENDER_VERBATIM(r, "&gt;");
        break;
      case '"':
        RENDER_VERBATIM(r, "&quot;");
        break;
      }
      off++;
    }
    else
    {
      break;
    }
    beg = off;
  }
}

static void
render_url_escaped(FmtHTML *r, const MD_CHAR *data, MD_SIZE size)
{
  static const MD_CHAR hex_chars[] = "0123456789ABCDEF";
  MD_OFFSET beg = 0;
  MD_OFFSET off = 0;

/* Some characters need to be escaped in URL attributes. */
#define NEED_URL_ESC(ch) (r->escape_map[(unsigned char)(ch)] & NEED_URL_ESC_FLAG)

  while (1)
  {
    while (off < size && !NEED_URL_ESC(data[off]))
      off++;
    if (off > beg)
      render_verbatim(r, data + beg, off - beg);

    if (off < size)
    {
      char hex[3];

      switch (data[off])
      {
      case '&':
        RENDER_VERBATIM(r, "&amp;");
        break;
      default:
        hex[0] = '%';
        hex[1] = hex_chars[((unsigned)data[off] >> 4) & 0xf];
        hex[2] = hex_chars[((unsigned)data[off] >> 0) & 0xf];
        render_verbatim(r, hex, 3);
        break;
      }
      off++;
    }
    else
    {
      break;
    }

    beg = off;
  }
}

static unsigned
hex_val(char ch)
{
  if ('0' <= ch && ch <= '9')
    return ch - '0';
  if ('A' <= ch && ch <= 'Z')
    return ch - 'A' + 10;
  else
    return ch - 'a' + 10;
}

static void
render_utf8_codepoint(FmtHTML *r, unsigned codepoint,
                      void (*fn_append)(FmtHTML *, const MD_CHAR *, MD_SIZE))
{
  static const MD_CHAR utf8_replacement_char[] = {0xef, 0xbf, 0xbd};

  unsigned char utf8[4];
  size_t n;

  if (codepoint <= 0x7f)
  {
    n = 1;
    utf8[0] = codepoint;
  }
  else if (codepoint <= 0x7ff)
  {
    n = 2;
    utf8[0] = 0xc0 | ((codepoint >> 6) & 0x1f);
    utf8[1] = 0x80 + ((codepoint >> 0) & 0x3f);
  }
  else if (codepoint <= 0xffff)
  {
    n = 3;
    utf8[0] = 0xe0 | ((codepoint >> 12) & 0xf);
    utf8[1] = 0x80 + ((codepoint >> 6) & 0x3f);
    utf8[2] = 0x80 + ((codepoint >> 0) & 0x3f);
  }
  else
  {
    n = 4;
    utf8[0] = 0xf0 | ((codepoint >> 18) & 0x7);
    utf8[1] = 0x80 + ((codepoint >> 12) & 0x3f);
    utf8[2] = 0x80 + ((codepoint >> 6) & 0x3f);
    utf8[3] = 0x80 + ((codepoint >> 0) & 0x3f);
  }

  if (0 < codepoint && codepoint <= 0x10ffff)
    fn_append(r, (char *)utf8, (MD_SIZE)n);
  else
    fn_append(r, utf8_replacement_char, 3);
}

/* Translate entity to its UTF-8 equivalent, or output the verbatim one
 * if such entity is unknown (or if the translation is disabled). */
static void
render_entity(FmtHTML *r, const MD_CHAR *text, MD_SIZE size,
              void (*fn_append)(FmtHTML *, const MD_CHAR *, MD_SIZE))
{
  if (r->flags & OutputFlagVerbatimEntites)
  {
    render_verbatim(r, text, size);
    return;
  }

  /* We assume UTF-8 output is what is desired. */
  if (size > 3 && text[1] == '#')
  {
    unsigned codepoint = 0;

    if (text[2] == 'x' || text[2] == 'X')
    {
      /* Hexadecimal entity (e.g. "&#x1234abcd;")). */
      MD_SIZE i;
      for (i = 3; i < size - 1; i++)
        codepoint = 16 * codepoint + hex_val(text[i]);
    }
    else
    {
      /* Decimal entity (e.g. "&1234;") */
      MD_SIZE i;
      for (i = 2; i < size - 1; i++)
        codepoint = 10 * codepoint + (text[i] - '0');
    }

    render_utf8_codepoint(r, codepoint, fn_append);
    return;
  }
  else
  {
    /* Named entity (e.g. "&nbsp;"). */
    const struct entity *ent;

    ent = entity_lookup(text, size);
    if (ent != NULL)
    {
      render_utf8_codepoint(r, ent->codepoints[0], fn_append);
      if (ent->codepoints[1])
        render_utf8_codepoint(r, ent->codepoints[1], fn_append);
      return;
    }
  }

  fn_append(r, text, size);
}

static char slugMap[256] = {
    /*          0    1    2    3    4    5    6    7    8    9    A    B    C    D    E    F */
    /* 0x00 */ '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', // <CTRL> ...
    /* 0x10 */ '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', // <CTRL> ...
    /* 0x20 */ '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '.', '-', //   ! " # $ % & ' ( ) * + , - . /
    /* 0x30 */ '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '-', '-', '-', '-', '-', '-', // 0 1 2 3 4 5 6 7 8 9 : ; < = > ?
    /* 0x40 */ '-', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', // @ A B C D E F G H I J K L M N O
    /* 0x50 */ 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '-', '-', '-', '-', '_', // P Q R S T U V W X Y Z [ \ ] ^ _
    /* 0x60 */ '-', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', // ` a b c d e f g h i j k l m n o
    /* 0x70 */ 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '-', '-', '-', '-', '-', // p q r s t u v w x y z { | } ~ <DEL>
    /* 0x80 */ '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', // <CTRL> ...
    /* 0x90 */ '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', // <CTRL> ...
    /* 0xA0 */ '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', // <NBSP> ¡ ¢ £ ¤ ¥ ¦ § ¨ © ª « ¬ <SOFTHYPEN> ® ¯
    /* 0xB0 */ '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', // ° ± ² ³ ´ µ ¶ · ¸ ¹ º » ¼ ½ ¾ ¿
    /* 0xC0 */ 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'c', 'e', 'e', 'e', 'e', 'i', 'i', 'i', 'i', // À Á Â Ã Ä Å Æ Ç È É Ê Ë Ì Í Î Ï
    /* 0xD0 */ 'd', 'n', 'o', 'o', 'o', 'o', 'o', 'x', 'o', 'u', 'u', 'u', 'u', 'y', '-', 's', // Ð Ñ Ò Ó Ô Õ Ö × Ø Ù Ú Û Ü Ý Þ ß
    /* 0xE0 */ 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'c', 'e', 'e', 'e', 'e', 'i', 'i', 'i', 'i', // à á â ã ä å æ ç è é ê ë ì í î ï
    /* 0xF0 */ 'd', 'n', 'o', 'o', 'o', 'o', 'o', '-', 'o', 'u', 'u', 'u', 'u', 'y', '-', 'y', // ð ñ ò ó ô õ ö ÷ ø ù ú û ü ý þ ÿ
};

static size_t WBufAppendSlug(WBuf *b, const MD_CHAR *pch, MD_SIZE len)
{
  WBufReserve(b, len);
  const char *start = b->ptr;
  char c = 0, pc = 0;
  for (size_t i = 0; i < len; i++)
  {
    u8 x = (u8)pch[i];
    if (x >= 0x80)
    {
      // decode UTF8-encoded character as Latin-1
      if ((x >> 5) == 0x6 && i + 1 < len)
      {
        u32 cp = ((x << 6) & 0x7ff) + ((pch[++i]) & 0x3f);
        x = cp <= 0xFF ? cp : 0;
      }
      else
      {
        x = 0;
      }
    }
    c = slugMap[x];
    if (c != '-' || (pc != '-' && pc))
    {
      // note: check "pc" to trim leading '-'
      *(b->ptr++) = c;
      pc = c;
    }
  }
  if (pc == '-')
  {
    // trim trailing '-'
    b->ptr--;
  }
  return b->ptr - start;
}

static void
render_attribute(FmtHTML *r, const MD_ATTRIBUTE *attr,
                 void (*fn_append)(FmtHTML *, const MD_CHAR *, MD_SIZE))
{
  int i;

  for (i = 0; attr->substr_offsets[i] < attr->size; i++)
  {
    MD_TEXTTYPE type = attr->substr_types[i];
    MD_OFFSET off = attr->substr_offsets[i];
    MD_SIZE size = attr->substr_offsets[i + 1] - off;
    const MD_CHAR *text = attr->text + off;

    switch (type)
    {
    case MD_TEXT_NULLCHAR:
      render_utf8_codepoint(r, 0x0000, render_verbatim);
      break;
    case MD_TEXT_ENTITY:
      render_entity(r, text, size, fn_append);
      break;
    default:
      fn_append(r, text, size);
      break;
    }
  }
}

static void
render_open_ol_block(FmtHTML *r, const MD_BLOCK_OL_DETAIL *det)
{
  char buf[64];

  if (det->start == 1)
  {
    RENDER_VERBATIM(r, "<ol>\n");
    return;
  }

  snprintf(buf, sizeof(buf), "<ol start=\"%u\">\n", det->start);
  RENDER_VERBATIM(r, buf);
}

static void render_open_li_block(FmtHTML *r, const MD_BLOCK_LI_DETAIL *det)
{
  RENDER_VERBATIM(r, "<li");
  if (det->is_task)
  {
    RENDER_VERBATIM(r, " class=\"task-list-item\"><input type=\"checkbox\" class=\"task-list-item-checkbox\"");
    if (r->flags & OutputFlagXHtml)
    {
      RENDER_VERBATIM(r, " disabled=\"disabled\"");
      if (det->task_mark == 'x' || det->task_mark == 'X')
      {
        RENDER_VERBATIM(r, " checked=\"checked\"");
      }
      RENDER_VERBATIM(r, " /");
    }
    else
    {
      RENDER_VERBATIM(r, " disabled");
      if (det->task_mark == 'x' || det->task_mark == 'X')
      {
        RENDER_VERBATIM(r, " checked");
      }
    }
  }
  RENDER_VERBATIM(r, ">");
}

static void
render_open_code_block(FmtHTML *r, const MD_BLOCK_CODE_DETAIL *det)
{
  RENDER_VERBATIM(r, "<pre><code");

  /* If known, output the HTML 5 attribute class="language-LANGNAME". */
  if (det->lang.text != NULL)
  {
    RENDER_VERBATIM(r, " class=\"language-");
    render_attribute(r, &det->lang, render_html_escaped);
    RENDER_VERBATIM(r, "\"");
  }

  RENDER_VERBATIM(r, ">");
}

static void
render_close_code_block(FmtHTML *r, const MD_BLOCK_CODE_DETAIL *det)
{
  if (r->flags & OutputFlagDebug)
  {

    dlog("end code block (lang \"%.*s\")", (int)det->lang.size, det->lang.text);
  }

  r->codeBlockNest--;

  if (r->onCodeBlock)
  {
    const char *text = r->tmpbuf.start;
    size_t len = WBufLen(&r->tmpbuf);

    int outlen = -1;

    if (len <= 0x7FFFFFFF)
    {
      const char *outptr = NULL;
      outlen = r->onCodeBlock(det->lang.text, (u32)det->lang.size, text, (u32)len, &outptr);
      if (outlen > 0 && outptr != NULL)
        WBufAppendBytes(r->outbuf, outptr, (size_t)outlen);
      if (outptr != NULL)
        free((void *)outptr);
    }

    if (outlen < 0)
    {
      // The function failed or opted out of taking care of formatting
      render_html_escaped(r, text, len);
    }

    WBufReset(&r->tmpbuf);
  }

  RENDER_VERBATIM(r, "</code></pre>\n");
}

static void
render_open_td_block(FmtHTML *r, const MD_CHAR *cell_type, const MD_BLOCK_TD_DETAIL *det)
{
  RENDER_VERBATIM(r, "<");
  RENDER_VERBATIM(r, cell_type);

  switch (det->align)
  {
  case MD_ALIGN_LEFT:
    RENDER_VERBATIM(r, " align=\"left\">");
    break;
  case MD_ALIGN_CENTER:
    RENDER_VERBATIM(r, " align=\"center\">");
    break;
  case MD_ALIGN_RIGHT:
    RENDER_VERBATIM(r, " align=\"right\">");
    break;
  default:
    RENDER_VERBATIM(r, ">");
    break;
  }
}

static bool
is_javascript_uri(const MD_CHAR *text, size_t len)
{
  return (
      len >= strlen("javascript:") &&
      strncasecmp(text, "javascript:", strlen("javascript:")) == 0);
}

static void
render_open_a_span(FmtHTML *r, const MD_SPAN_A_DETAIL *det)
{
  RENDER_VERBATIM(r, "<a href=\"");
  // skip "javascript:" URIs unless explicitly allowed
  if ((r->flags & OutputFlagAllowJSURI) != 0 ||
      !is_javascript_uri(det->href.text, det->href.size))
  {
    render_attribute(r, &det->href, render_url_escaped);
  }
  if (det->title.text != NULL)
  {
    RENDER_VERBATIM(r, "\" title=\"");
    render_attribute(r, &det->title, render_html_escaped);
  }

  RENDER_VERBATIM(r, "\">");
}

static void
render_open_img_span(FmtHTML *r, const MD_SPAN_IMG_DETAIL *det)
{
  RENDER_VERBATIM(r, "<img src=\"");
  render_attribute(r, &det->src, render_url_escaped);

  RENDER_VERBATIM(r, "\" alt=\"");

  r->image_nesting_level++;
}

static void
render_close_img_span(FmtHTML *r, const MD_SPAN_IMG_DETAIL *det)
{
  if (det->title.text != NULL)
  {
    RENDER_VERBATIM(r, "\" title=\"");
    render_attribute(r, &det->title, render_html_escaped);
  }

  RENDER_VERBATIM(r, (r->flags & OutputFlagXHtml) ? "\" />" : "\">");

  r->image_nesting_level--;
}

static void
render_open_wikilink_span(FmtHTML *r, const MD_SPAN_WIKILINK_DETAIL *det)
{
  RENDER_VERBATIM(r, "<x-wikilink data-target=\"");
  render_attribute(r, &det->target, render_html_escaped);
  RENDER_VERBATIM(r, "\">");
}
/**************************************
 ***  HTML renderer implementation  ***
 **************************************/

static int
enter_block_callback(MD_BLOCKTYPE type, void *detail, void *userdata)
{
  static const MD_CHAR *head[6] = {"<h1>", "<h2>", "<h3>", "<h4>", "<h5>", "<h6>"};
  FmtHTML *r = (FmtHTML *)userdata;

  switch (type)
  {
  case MD_BLOCK_DOC: /* noop */
    break;
  case MD_BLOCK_QUOTE:
    RENDER_VERBATIM(r, "<blockquote>\n");
    break;
  case MD_BLOCK_UL:
    RENDER_VERBATIM(r, "<ul>\n");
    break;
  case MD_BLOCK_OL:
    render_open_ol_block(r, (const MD_BLOCK_OL_DETAIL *)detail);
    break;
  case MD_BLOCK_LI:
    render_open_li_block(r, (const MD_BLOCK_LI_DETAIL *)detail);
    break;
  case MD_BLOCK_HR:
    RENDER_VERBATIM(r, (r->flags & OutputFlagXHtml) ? "<hr />\n" : "<hr>\n");
    break;
  case MD_BLOCK_H:
    RENDER_VERBATIM(r, head[((MD_BLOCK_H_DETAIL *)detail)->level - 1]);
    r->addanchor = !(r->flags & OutputFlagDisableHeadlineAnchors);
    break;
  case MD_BLOCK_CODE:
    render_open_code_block(r, (const MD_BLOCK_CODE_DETAIL *)detail);
    break;
  case MD_BLOCK_HTML: /* noop */
    break;
  case MD_BLOCK_P:
    RENDER_VERBATIM(r, "<p>");
    break;
  case MD_BLOCK_TABLE:
    RENDER_VERBATIM(r, "<table>\n");
    break;
  case MD_BLOCK_THEAD:
    RENDER_VERBATIM(r, "<thead>\n");
    break;
  case MD_BLOCK_TBODY:
    RENDER_VERBATIM(r, "<tbody>\n");
    break;
  case MD_BLOCK_TR:
    RENDER_VERBATIM(r, "<tr>\n");
    break;
  case MD_BLOCK_TH:
    render_open_td_block(r, "th", (MD_BLOCK_TD_DETAIL *)detail);
    break;
  case MD_BLOCK_TD:
    render_open_td_block(r, "td", (MD_BLOCK_TD_DETAIL *)detail);
    break;
  }

  return 0;
}

static int
leave_block_callback(MD_BLOCKTYPE type, void *detail, void *userdata)
{
  static const MD_CHAR *head[6] = {"</h1>\n", "</h2>\n", "</h3>\n", "</h4>\n", "</h5>\n", "</h6>\n"};
  FmtHTML *r = (FmtHTML *)userdata;

  switch (type)
  {
  case MD_BLOCK_DOC: /*noop*/
    break;
  case MD_BLOCK_QUOTE:
    RENDER_VERBATIM(r, "</blockquote>\n");
    break;
  case MD_BLOCK_UL:
    RENDER_VERBATIM(r, "</ul>\n");
    break;
  case MD_BLOCK_OL:
    RENDER_VERBATIM(r, "</ol>\n");
    break;
  case MD_BLOCK_LI:
    RENDER_VERBATIM(r, "</li>\n");
    break;
  case MD_BLOCK_HR: /*noop*/
    break;
  case MD_BLOCK_H:
    RENDER_VERBATIM(r, head[((MD_BLOCK_H_DETAIL *)detail)->level - 1]);
    break;
  case MD_BLOCK_CODE:
    render_close_code_block(r, (const MD_BLOCK_CODE_DETAIL *)detail);
    break;
  case MD_BLOCK_HTML: /* noop */
    break;
  case MD_BLOCK_P:
    RENDER_VERBATIM(r, "</p>\n");
    break;
  case MD_BLOCK_TABLE:
    RENDER_VERBATIM(r, "</table>\n");
    break;
  case MD_BLOCK_THEAD:
    RENDER_VERBATIM(r, "</thead>\n");
    break;
  case MD_BLOCK_TBODY:
    RENDER_VERBATIM(r, "</tbody>\n");
    break;
  case MD_BLOCK_TR:
    RENDER_VERBATIM(r, "</tr>\n");
    break;
  case MD_BLOCK_TH:
    RENDER_VERBATIM(r, "</th>\n");
    break;
  case MD_BLOCK_TD:
    RENDER_VERBATIM(r, "</td>\n");
    break;
  }

  return 0;
}

static int
enter_span_callback(MD_SPANTYPE type, void *detail, void *userdata)
{
  FmtHTML *r = (FmtHTML *)userdata;

  if (r->image_nesting_level > 0)
  {
    /* We are inside a Markdown image label. Markdown allows to use any
     * emphasis and other rich contents in that context similarly as in
     * any link label.
     *
     * However, unlike in the case of links (where that contents becomes
     * contents of the <a>...</a> tag), in the case of images the contents
     * is supposed to fall into the attribute alt: <img alt="...">.
     *
     * In that context we naturally cannot output nested HTML tags. So lets
     * suppress them and only output the plain text (i.e. what falls into
     * text() callback).
     *
     * This make-it-a-plain-text approach is the recommended practice by
     * CommonMark specification (for HTML output).
     */
    return 0;
  }

  switch (type)
  {
  case MD_SPAN_EM:
    RENDER_VERBATIM(r, "<em>");
    break;
  case MD_SPAN_STRONG:
    RENDER_VERBATIM(r, "<strong>");
    break;
  case MD_SPAN_U:
    RENDER_VERBATIM(r, "<u>");
    break;
  case MD_SPAN_A:
    render_open_a_span(r, (MD_SPAN_A_DETAIL *)detail);
    break;
  case MD_SPAN_IMG:
    render_open_img_span(r, (MD_SPAN_IMG_DETAIL *)detail);
    break;
  case MD_SPAN_CODE:
    RENDER_VERBATIM(r, "<code>");
    break;
  case MD_SPAN_DEL:
    RENDER_VERBATIM(r, "<del>");
    break;
  case MD_SPAN_LATEXMATH:
    RENDER_VERBATIM(r, "<x-equation>");
    break;
  case MD_SPAN_LATEXMATH_DISPLAY:
    RENDER_VERBATIM(r, "<x-equation type=\"display\">");
    break;
  case MD_SPAN_WIKILINK:
    render_open_wikilink_span(r, (MD_SPAN_WIKILINK_DETAIL *)detail);
    break;
  }

  return 0;
}

static int
leave_span_callback(MD_SPANTYPE type, void *detail, void *userdata)
{
  FmtHTML *r = (FmtHTML *)userdata;

  if (r->image_nesting_level > 0)
  {
    /* Ditto as in enter_span_callback(), except we have to allow the
     * end of the <img> tag. */
    if (r->image_nesting_level == 1 && type == MD_SPAN_IMG)
      render_close_img_span(r, (MD_SPAN_IMG_DETAIL *)detail);
    return 0;
  }

  switch (type)
  {
  case MD_SPAN_EM:
    RENDER_VERBATIM(r, "</em>");
    break;
  case MD_SPAN_STRONG:
    RENDER_VERBATIM(r, "</strong>");
    break;
  case MD_SPAN_U:
    RENDER_VERBATIM(r, "</u>");
    break;
  case MD_SPAN_A:
    RENDER_VERBATIM(r, "</a>");
    break;
  case MD_SPAN_IMG: /*noop, handled above*/
    break;
  case MD_SPAN_CODE:
    RENDER_VERBATIM(r, "</code>");
    break;
  case MD_SPAN_DEL:
    RENDER_VERBATIM(r, "</del>");
    break;
  case MD_SPAN_LATEXMATH: /*fall through*/
  case MD_SPAN_LATEXMATH_DISPLAY:
    RENDER_VERBATIM(r, "</x-equation>");
    break;
  case MD_SPAN_WIKILINK:
    RENDER_VERBATIM(r, "</x-wikilink>");
    break;
  }

  return 0;
}

static int
text_callback(MD_TEXTTYPE type, const MD_CHAR *text, MD_SIZE size, void *userdata)
{
  FmtHTML *r = (FmtHTML *)userdata;

  if (r->codeBlockNest && r->onCodeBlock)
  {
    WBufAppendBytes(&r->tmpbuf, text, size);
    return 0;
  }

  if (r->addanchor)
  {
    r->addanchor = 0;
    if (type != MD_TEXT_NULLCHAR && type != MD_TEXT_BR && type != MD_TEXT_SOFTBR)
    {
      RENDER_VERBATIM(r, "<a id=\"");

      const char *slugptr = r->outbuf->ptr;
      size_t sluglen = WBufAppendSlug(r->outbuf, text, size);

      RENDER_VERBATIM(r, "\" class=\"anchor\" aria-hidden=\"true\" href=\"#");

      if (sluglen > 0)
      {
        WBufReserve(r->outbuf, sluglen);
        memcpy(r->outbuf->ptr, slugptr, sluglen);
        r->outbuf->ptr += sluglen;
      }

      RENDER_VERBATIM(r, "\"></a>");
    }
  }

  switch (type)
  {
  case MD_TEXT_NULLCHAR:
    render_utf8_codepoint(r, 0x0000, render_verbatim);
    break;
  case MD_TEXT_BR:
    RENDER_VERBATIM(r, (r->image_nesting_level == 0
                            ? ((r->flags & OutputFlagXHtml) ? "<br />\n" : "<br>\n")
                            : " "));
    break;
  case MD_TEXT_SOFTBR:
    RENDER_VERBATIM(r, (r->image_nesting_level == 0 ? "\n" : " "));
    break;
  case MD_TEXT_HTML:
    render_verbatim(r, text, size);
    break;
  case MD_TEXT_ENTITY:
    render_entity(r, text, size, render_html_escaped);
    break;
  default:
    render_html_escaped(r, text, size);
    break;
  }

  return 0;
}

static void
debug_log_callback(const char *msg, void *userdata)
{
  FmtHTML *r = (FmtHTML *)userdata;
  if (r->flags & OutputFlagDebug)
    dlog("MD4C: %s\n", msg);
}

int fmt_html(const MD_CHAR *input, MD_SIZE input_size, FmtHTML *fmt)
{

  int i;

  fmt->image_nesting_level = 0;
  fmt->addanchor = 0;
  fmt->codeBlockNest = 0;
  fmt->tmpbuf = (WBuf){0};

  MD_PARSER parser = {
      0,
      fmt->parserFlags,
      enter_block_callback,
      leave_block_callback,
      enter_span_callback,
      leave_span_callback,
      text_callback,
      debug_log_callback,
      NULL};

  /* Build map of characters which need escaping. */
  for (i = 0; i < 256; i++)
  {
    unsigned char ch = (unsigned char)i;

    if (strchr("\"&<>", ch) != NULL)
      fmt->escape_map[i] |= NEED_HTML_ESC_FLAG;

    if (!ISALNUM(ch) && strchr("~-_.+!*(),%#@?=;:/,+$", ch) == NULL)
      fmt->escape_map[i] |= NEED_URL_ESC_FLAG;
  }

  /* Consider skipping UTF-8 byte order mark (BOM). */
  if (fmt->flags & OutputFlagSkipUtf8Bom && sizeof(MD_CHAR) == 1)
  {
    static const MD_CHAR bom[3] = {0xef, 0xbb, 0xbf};
    if (input_size >= sizeof(bom) && memcmp(input, bom, sizeof(bom)) == 0)
    {
      input += sizeof(bom);
      input_size -= sizeof(bom);
    }
  }

  WBufInit(&fmt->tmpbuf);

  int res = md_parse(input, input_size, &parser, (void *)fmt);

  WBufFree(&fmt->tmpbuf);

  return res;
}
