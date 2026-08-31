/** A view into wasm heap memory returned by {@link withOutPtr}. */
export type HeapData = Uint8Array & {
  heapAddr: number;
};
