class Variable {
  constructor (name) {
    this.value = name
  }

  equals (other) {
    return !!other && other.termType === this.termType && other.value === this.value
  }
}

Variable.prototype.termType = 'Variable'

export default Variable
