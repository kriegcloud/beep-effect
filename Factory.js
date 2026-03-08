import Validator from './Validator.js'

class Factory {
  init () {
    this.shacl = {}
    this.shacl.validator = (dataset, options) => {
      return new Validator(dataset, { ...options, factory: this })
    }
  }
}

export default Factory
