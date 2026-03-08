import JsonLdSerializerBase from '@rdfjs/serializer-jsonld'

class JsonLdSerializer extends JsonLdSerializerBase {
  constructor ({ ...args } = {}) {
    super({ ...args, encoding: 'string' })
  }
}

export default JsonLdSerializer
