import TermMap from './TermMap.js'

class Factory {
  termMap (entries) {
    return new TermMap(entries)
  }
}

Factory.exports = ['termMap']

export default Factory
