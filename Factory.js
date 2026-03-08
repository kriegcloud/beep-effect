import TermSet from './TermSet.js'

class Factory {
  termSet (terms) {
    return new TermSet(terms)
  }
}

Factory.exports = ['termSet']

export default Factory
