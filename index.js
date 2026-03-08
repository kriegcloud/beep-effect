class Sink {
  constructor (Impl, options) {
    this.Impl = Impl
    this.options = options
  }

  import (input, options) {
    const output = new this.Impl(input, { ...this.options, ...options })

    input.on('end', () => {
      if (!output.readable) {
        output.emit('end')
      }
    })

    input.on('error', err => {
      output.emit('error', err)
    })

    return output
  }
}

export default Sink
