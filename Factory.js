import * as datasetIo from './dataset.js'
import * as streamIo from './stream.js'

class Factory {
  init () {
    this.io = {
      dataset: {
        fromText: (mediaType, text, args) => datasetIo.fromText(mediaType, text, { ...args, factory: this }),
        fromURL: (url, args) => datasetIo.fromURL(url, { ...args, factory: this }),
        toText: (mediaType, dataset, args) => datasetIo.toText(mediaType, dataset, { ...args, factory: this }),
        toURL: (url, dataset, args) => datasetIo.toURL(url, dataset, { ...args, factory: this })
      },
      stream: {
        fromText: (mediaType, text, args) => streamIo.fromText(mediaType, text, { ...args, factory: this }),
        fromURL: (url, args) => streamIo.fromURL(url, { ...args, factory: this }),
        toText: (mediaType, stream, args) => streamIo.toText(mediaType, stream, { ...args, factory: this }),
        toURL: (url, stream, args) => streamIo.toURL(url, { ...args, factory: this })
      }
    }
  }
}

export default Factory
