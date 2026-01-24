// Minimal Bun global typing so `bun x tsc --noEmit` passes.
// Keep lightweight; this project uses Bun for scripts.

declare const Bun: {
  write(path: string, data: string | ArrayBuffer | Uint8Array | Blob): Promise<void>;
};
