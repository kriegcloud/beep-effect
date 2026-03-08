import SinkMap from '@rdfjs/sink-map'
import defaultFormats, { PrettyJsonLdSerializer, TurtleSerializer } from './index.js'

const parsers = new SinkMap(defaultFormats.parsers)

const serializers = new SinkMap(defaultFormats.serializers)

serializers.set('application/ld+json', new PrettyJsonLdSerializer())
serializers.set('text/n3', new TurtleSerializer())
serializers.set('text/turtle', new TurtleSerializer())

const formats = {
  parsers,
  serializers
}

export default formats
