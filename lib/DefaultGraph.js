class DefaultGraph {
  equals (other) {
    return !!other && other.termType === this.termType
  }
}

DefaultGraph.prototype.termType = 'DefaultGraph'
DefaultGraph.prototype.value = ''

export default DefaultGraph
