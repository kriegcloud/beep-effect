/*!
 * Copyright (c) 2023 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

require('setimmediate');

exports.setImmediate = setImmediate;

// WebCrypto
exports.crypto = globalThis.crypto;

// precompute byte to hex table
const byteToHex = [];
for(let n = 0; n <= 0xff; ++n) {
  byteToHex.push(n.toString(16).padStart(2, '0'));
}

exports.bufferToHex = function bufferToHex(buffer) {
  let hex = '';
  const bytes = new Uint8Array(buffer);
  for(let i = 0; i < bytes.length; ++i) {
    hex += byteToHex[bytes[i]];
  }
  return hex;
};
