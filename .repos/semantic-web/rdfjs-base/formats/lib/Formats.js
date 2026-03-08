import SinkMap from '@rdfjs/sink-map'

class Formats {
  constructor ({ factory }) {
    this.factory = factory
    this.parsers = new SinkMap()
    this.serializers = new SinkMap()
  }

  import (other) {
    if (other.parsers) {
      for (const [mediaType, parser] of other.parsers) {
        this.parsers.set(mediaType, new parser.constructor({ factory: this.factory }))
      }
    }

    if (other.serializers) {
      for (const [mediaType, serializer] of other.serializers) {
        this.serializers.set(mediaType, new serializer.constructor({ factory: this.factory }))
      }
    }

    return this
  }
}

export default Formats
