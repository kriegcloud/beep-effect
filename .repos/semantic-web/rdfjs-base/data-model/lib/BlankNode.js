class BlankNode {
  constructor (id) {
    this.value = id
  }

  equals (other) {
    return !!other && other.termType === this.termType && other.value === this.value
  }
}

BlankNode.prototype.termType = 'BlankNode'

export default BlankNode
