/*!
 * Copyright (c) 2016-2023 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const {bufferToHex, crypto} = require('./platform');

const algorithmMap = new Map([
  ['sha256', 'SHA-256'],
  ['SHA256', 'SHA-256'],
  ['SHA-256', 'SHA-256'],
  ['sha384', 'SHA-384'],
  ['SHA384', 'SHA-384'],
  ['SHA-384', 'SHA-384'],
  ['sha512', 'SHA-512'],
  ['SHA512', 'SHA-512'],
  ['SHA-512', 'SHA-512'],
]);

module.exports = class MessageDigest {
  /**
   * Creates a new WebCrypto API MessageDigest.
   *
   * @param {string} algorithm - The algorithm to use.
   */
  constructor(algorithm) {
    // check if crypto.subtle is available
    // check is here rather than top-level to only fail if class is used
    if(!(crypto && crypto.subtle)) {
      throw new Error('crypto.subtle not found.');
    }
    if(!algorithmMap.has(algorithm)) {
      throw new Error(`Unsupported algorithm "${algorithm}".`);
    }
    this.algorithm = algorithmMap.get(algorithm);
    this._content = '';
  }

  update(msg) {
    this._content += msg;
  }

  async digest() {
    const data = new TextEncoder().encode(this._content);
    const buffer = await crypto.subtle.digest(this.algorithm, data);
    return bufferToHex(buffer);
  }
};
