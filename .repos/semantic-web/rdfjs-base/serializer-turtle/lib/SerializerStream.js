import { Readable } from 'readable-stream'
import chunks from 'stream-chunks/chunks.js'
import TurtleSerializer from './TurtleSerializer.js'

class SerializerStream extends Readable {
  constructor (input, { baseIRI, prefixes = new Map() } = {}) {
    super({
      objectMode: true,
      read: () => {}
    })

    this._init(input, { baseIRI, prefixes })
  }

  async _init (input, { baseIRI, prefixes }) {
    try {
      input.on('prefix', (prefix, namespace) => prefixes.set(prefix, namespace))

      const quads = await chunks(input)

      TurtleSerializer.serialize(quads, { baseIRI, output: this, prefixes })

      this.push(null)
    } catch (err) {
      this.destroy(err)
    }
  }
}

export default SerializerStream
