class SinkMap extends Map {
  import (key, input, options) {
    const parser = this.get(key)

    if (!parser) {
      return null
    }

    return parser.import(input, options)
  }
}

export default SinkMap
