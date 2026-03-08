import Traverser from './Traverser.js'

class Factory {
  traverser (filter, { backward = false, forward = true } = {}) {
    return new Traverser(filter, { backward, factory: this, forward })
  }
}

Factory.exports = ['traverser']

export default Factory
