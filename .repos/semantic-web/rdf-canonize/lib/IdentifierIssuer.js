/*
 * Copyright (c) 2016-2021 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

module.exports = class IdentifierIssuer {
  /**
   * Creates a new IdentifierIssuer. A IdentifierIssuer issues unique
   * identifiers, keeping track of any previously issued identifiers.
   *
   * @param {string} prefix - The prefix to use ('<prefix><counter>').
   * @param {Map} [existing] - An existing Map to use.
   * @param {number} [counter] - The counter to use.
   */
  constructor(prefix, existing = new Map(), counter = 0) {
    this.prefix = prefix;
    this._existing = existing;
    this.counter = counter;
  }

  /**
   * Copies this IdentifierIssuer.
   *
   * @returns {object} - A copy of this IdentifierIssuer.
   */
  clone() {
    const {prefix, _existing, counter} = this;
    return new IdentifierIssuer(prefix, new Map(_existing), counter);
  }

  /**
   * Gets the new identifier for the given old identifier, where if no old
   * identifier is given a new identifier will be generated.
   *
   * @param {string} [old] - The old identifier to get the new identifier for.
   *
   * @returns {string} - The new identifier.
   */
  getId(old) {
    // return existing old identifier
    const existing = old && this._existing.get(old);
    if(existing) {
      return existing;
    }

    // get next identifier
    const identifier = this.prefix + this.counter;
    this.counter++;

    // save mapping
    if(old) {
      this._existing.set(old, identifier);
    }

    return identifier;
  }

  /**
   * Returns true if the given old identifer has already been assigned a new
   * identifier.
   *
   * @param {string} old - The old identifier to check.
   *
   * @returns {boolean} - True if the old identifier has been assigned a new
   *   identifier, false if not.
   */
  hasId(old) {
    return this._existing.has(old);
  }

  /**
   * Returns all of the IDs that have been issued new IDs in the order in
   * which they were issued new IDs.
   *
   * @returns {Array} - The list of old IDs that has been issued new IDs in
   *   order.
   */
  getOldIds() {
    return [...this._existing.keys()];
  }
};
