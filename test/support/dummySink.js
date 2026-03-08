const { Readable } = require('readable-stream')

function dummySink ({ chunks = [], writeCallback = () => {} } = {}) {
  return {
    import: input => {
      input.on('data', writeCallback)

      const output = new Readable({
        read: () => {
          chunks.forEach(chunk => output.push(chunk))

          output.push(null)
        }
      })

      return output
    }
  }
}

module.exports = dummySink
