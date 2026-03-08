class Literal {
  constructor (value, language, datatype, direction = '') {
    this.value = value
    this.language = language
    this.datatype = datatype
    this.direction = direction
  }

  equals (other) {
    return !!other &&
      other.termType === this.termType &&
      other.value === this.value &&
      other.language === this.language &&
      other.datatype.equals(this.datatype) &&
      (other.direction || '') === this.direction
  }
}

Literal.prototype.termType = 'Literal'

export default Literal
