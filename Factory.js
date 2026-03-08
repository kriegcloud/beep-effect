import Formats from './lib/Formats.js'

class Factory {
  init () {
    this.formats = new Formats({ factory: this })
  }

  clone (original) {
    this.formats.import(original.formats)
  }
}

export default Factory
