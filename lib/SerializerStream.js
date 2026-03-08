import toNT from '@rdfjs/to-ntriples'
import toReadable from 'duplex-to/readable.js'
import { Transform } from 'readable-stream'

class SerializerStream {
  constructor (input) {
    const stream = new Transform({
      objectMode: true,
      transform: (quad, encoding, callback) => {
        callback(null, `${toNT(quad)}\n`)
      }
    })

    input.pipe(stream)

    return toReadable(stream)
  }
}

export default SerializerStream
