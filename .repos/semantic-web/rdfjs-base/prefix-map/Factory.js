import PrefixMap from './PrefixMap.js'

class Factory {
  init () {
    this.prefixes = new PrefixMap([], { factory: this })
  }

  clone (original) {
    if (original.prefixes) {
      for (const [prefix, term] of original.prefixes) {
        this.prefixes.set(prefix, term)
      }
    }
  }

  prefixMap (prefixes) {
    return new PrefixMap(prefixes, { factory: this })
  }
}

Factory.exports = ['prefixMap']

export default Factory
