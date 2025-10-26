export const uint8arrayToArrayBuffer = (data: Uint8Array<ArrayBufferLike>): ArrayBuffer =>
  data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
