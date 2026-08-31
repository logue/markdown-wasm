/// <reference types="emscripten" />

/** Initialize markdown.wasm Module */
export interface ModuleOptions {
  locateFile?: (filename: string) => string;
  [key: string]: unknown;
}

export default function Module(
  moduleArg?: ModuleOptions,
): Promise<MarkdownModule>;

export interface MarkdownModule extends EmscriptenModule {
  addFunction(func: (...args: any[]) => any, signature?: string): number;
  removeFunction(funcPtr: number): void;
  /** Convert UTF8 bytes in memory to JS string */
  UTF8ArrayToString(mem: Uint8Array, ptr: number): string;
  /** Register callback executed after wasm post run */
  addOnPostRun(cb: () => void): void;
  ready: Promise<MarkdownModule>;

  // md.c
  /** @returns Length of the data written at `outptr` (via {@link withOutPtr}) */
  _parseUTF8(
    inbufptr: number,
    inbuflen: number,
    parser_flags: number,
    outflags: number,
    outptr: number,
    onCodeBlock: number,
  ): number;

  // wlib.c

  /** alias of realloc */
  _wrealloc(ptr: number, size: number): number;

  /** alias of free */
  _wfree(ptr: number): void;

  /** code and pointer to message (in wasm heap memory) */
  _WErrSet(code: number, msg: number): boolean;

  /** clear error state */
  _WErrClear(): void;

  /** read code */
  _WErrGetCode(): number;

  /** read pointer to message (in wasm heap memory) */
  _WErrGetMsg(): number;
}
