class StringEncoder {
  constructor (stream) {
    this.stream = stream
    this.first = true

    this.stream.push('[')
  }

  push (jsonld) {
    if (this.first) {
      this.first = false
    } else {
      this.stream.push(',')
    }

    this.stream.push(JSON.stringify(jsonld))
  }

  end () {
    this.stream.push(']')
    this.stream.push(null)
  }
}

export default StringEncoder
