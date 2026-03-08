/* global describe, expect, it */

const dummySink = require('./support/dummySink')
const getStream = require('get-stream')
const { isDuplex } = require('isstream')
const sinkToDuplex = require('..')

describe('sink-to-duplex', () => {
  it('is a function', () => {
    expect(typeof sinkToDuplex).toBe('function')
  })

  it('accepts a sink as input', () => {
    expect(typeof sinkToDuplex(dummySink())).toBe('object')
  })

  it('returns a duplex stream', () => {
    expect(isDuplex(sinkToDuplex(dummySink()))).toBe(true)
  })

  it('forwards chunks written to the writable to the input stream of the sink', async () => {
    const expected = [Buffer.from('123'), Buffer.from('456')]
    const actual = []

    const duplex = sinkToDuplex(dummySink({
      writeCallback: chunk => actual.push(chunk)
    }))

    expected.forEach(chunk => duplex.write(chunk))
    duplex.end()

    await getStream(duplex)

    expect(actual).toEqual(expected)
  })

  it('forwards chunks from the sink to the readable of the duplex', async () => {
    const expected = [Buffer.from('123'), Buffer.from('456')]

    const duplex = sinkToDuplex(dummySink({
      chunks: expected
    }))

    duplex.end()

    const actual = await getStream.array(duplex)

    expect(actual).toEqual(expected)
  })

  it('uses the given options for the duplex stream', () => {
    const duplex = sinkToDuplex(dummySink(), { writableObjectMode: true, readableObjectMode: true })

    expect(duplex._writableState.objectMode).toBe(true)
    expect(duplex._readableState.objectMode).toBe(true)
  })
})
