/*
 * Copyright (c) 2016-2023 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const crypto = require('crypto');

const algorithmMap = new Map([
  ['sha256', 'sha256'],
  ['SHA256', 'sha256'],
  ['SHA-256', 'sha256'],
  ['sha384', 'sha384'],
  ['SHA384', 'sha384'],
  ['SHA-384', 'sha384'],
  ['sha512', 'sha512'],
  ['SHA512', 'sha512'],
  ['SHA-512', 'sha512'],
]);

module.exports = class MessageDigest {
  /**
   * Creates a new MessageDigest.
   *
   * @param {string} algorithm - The algorithm to use.
   */
  constructor(algorithm) {
    if(!algorithmMap.has(algorithm)) {
      throw new Error(`Unsupported algorithm "${algorithm}".`);
    }
    this.md = crypto.createHash(algorithmMap.get(algorithm));
  }

  update(msg) {
    this.md.update(msg, 'utf8');
  }

  // async code awaits this but it is not async to support
  // the sync code
  digest() {
    return this.md.digest('hex');
  }
};
