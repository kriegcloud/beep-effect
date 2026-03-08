import DatasetCore from './DatasetCore.js'

class Factory {
  dataset (quads) {
    return new DatasetCore(quads)
  }
}

Factory.exports = ['dataset']

export default Factory
