import JsonLdSerializer from '@rdfjs/serializer-jsonld-ext'

class PrettyJsonLdSerializer extends JsonLdSerializer {
  constructor ({ ...args } = {}) {
    super({
      ...args,
      compact: true,
      encoding: 'string',
      prettyPrint: true
    })
  }
}

export default PrettyJsonLdSerializer
