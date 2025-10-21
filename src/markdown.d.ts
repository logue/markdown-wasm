/* eslint-disable spaced-comment */
/// <reference types="emscripten" />

/** Initialize markdown.wasm Module */
export default function Module(): Promise<MarkdownModule>;

export interface MarkdownModule extends EmscriptenModule {
  addFunction(func: (...args: any[]) => any, signature?: string): number;
  removeFunction(funcPtr: number): void;
  /** Convert UTF8 bytes in memory to JS string */
  UTF8ArrayToString(mem: Uint8Array, ptr: number): string;
  /** Register callback executed after wasm post run */
  addOnPostRun(cb: () => void): void;
  ready: Promise<MarkdownModule>;

  // md.c
  _parseUTF8(
    inbufptr: number,
    inbuflen: number,
    parser_flags: number,
    outflags: number,
    outptr: number,
    onCodeBlock: number
  ): Uint8Array;

  // wlib.c

  /** alias of realloc */
  _wrealloc(ptr: number, size: number): number;

  /** alias of free */
  _wfree(ptr: number): void;

  /** code and message */
  _WErrSet(code: number, msg: string): boolean;

  /** clear error state */
  _WErrClear(): void;

  /** read code */
  _WErrGetCode(): number;

  /** read message */
  _WErrGetMsg(): string;
}
