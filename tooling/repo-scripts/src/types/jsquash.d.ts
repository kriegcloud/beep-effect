declare module "@jsquash/avif/encode" {
  export interface EncodeAvifOptions {
    readonly quality?: number;
    readonly speed?: number;
    readonly subsample?: "420" | "422" | "444";
  }

  export function init(module: WebAssembly.Module): Promise<void>;

  const encodeAvif: (image: ImageData, options?: EncodeAvifOptions) => Promise<ArrayBuffer>;

  export default encodeAvif;
}

declare module "@jsquash/jpeg/decode" {
  export function init(module: WebAssembly.Module): Promise<void>;

  const decodeJpeg: (source: ArrayBuffer | ArrayBufferView) => Promise<ImageData | null | undefined>;

  export default decodeJpeg;
}

declare module "@jsquash/png/decode" {
  export function init(module: WebAssembly.Module): Promise<void>;

  const decodePng: (source: ArrayBuffer | ArrayBufferView) => Promise<ImageData | null | undefined>;

  export default decodePng;
}

declare module "@jsquash/webp/decode" {
  export function init(module: WebAssembly.Module): Promise<void>;

  const decodeWebp: (source: ArrayBuffer | ArrayBufferView) => Promise<ImageData | null | undefined>;

  export default decodeWebp;
}
