class ObjectEncoder {
  constructor (stream) {
    this.stream = stream
    this.array = []
  }

  push (jsonld) {
    this.array.push(jsonld)
  }

  end () {
    this.stream.push(this.array)
    this.stream.push(null)
  }
}

export default ObjectEncoder
