import Sink from '@rdfjs/sink'
import PlainSerializer from './lib/PlainSerializer.js'
import SerializerStream from './lib/SerializerStream.js'

class Serializer extends Sink {
  constructor (options) {
    super(SerializerStream, options)
  }

  transform (quads) {
    return (new PlainSerializer(this.options)).transform(quads)
  }
}

export default Serializer
