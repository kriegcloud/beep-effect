type ArrayBufferToUint8Array = (buffer: ArrayBuffer) => Uint8Array;
export const arrayBufferToUint8Array: ArrayBufferToUint8Array = (buffer: ArrayBuffer) => new Uint8Array(buffer);
