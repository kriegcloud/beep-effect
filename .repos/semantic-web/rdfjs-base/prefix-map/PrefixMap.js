import { finished } from 'readable-stream'

class PrefixMap extends Map {
  constructor (prefixes = [], { factory }) {
    super(prefixes)

    this.factory = factory
  }

  resolve (term) {
    if (term.value.includes('://')) {
      return null
    }

    const [prefix, path] = term.value.split(':', 2)

    if (path === undefined) {
      return null
    }

    if (!this.has(prefix)) {
      return null
    }

    return this.factory.namedNode(`${this.get(prefix).value}${path}`)
  }

  shrink (term) {
    if (!term) {
      return null
    }

    const [pair] = [...this]
      .filter(([, namespace]) => term.value.startsWith(namespace.value))
      .sort((a, b) => b[1].value.length - a[1].value.length)

    if (pair === undefined) {
      return null
    }

    return this.factory.namedNode(`${pair[0]}:${term.value.slice(pair[1].value.length)}`)
  }

  import (stream) {
    stream.on('prefix', (prefix, namespace) => {
      this.set(prefix, namespace)
    })

    return new Promise((resolve, reject) => {
      finished(stream, err => {
        if (err) {
          reject(err)
        } else {
          resolve(this)
        }
      })
    })
  }

  export (stream) {
    for (const [prefix, namespace] of this) {
      stream.emit('prefix', prefix, namespace)
    }

    return this
  }
}

export default PrefixMap
