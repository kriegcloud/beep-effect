const duplexify = require('duplexify')
const { PassThrough } = require('readable-stream')

function sinkToDuplex (sink, options = {}) {
  const input = new PassThrough({
    objectMode: options.writableObjectMode || options.objectMode
  })

  const output = sink.import(input)

  return duplexify(input, output, options)
}

module.exports = sinkToDuplex
