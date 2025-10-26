type ArrayBufferToBlob = (buffer: ArrayBuffer) => Blob;
export const arrayBufferToBlob: ArrayBufferToBlob = (buffer: ArrayBuffer) => new Blob([new Uint8Array(buffer)]);
