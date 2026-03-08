import { rejects, strictEqual } from 'node:assert'
import { describe, it } from 'mocha'
import checkResponse from '../lib/checkResponse.js'

describe('checkResponse', () => {
  it('should be a function', () => {
    strictEqual(typeof checkResponse, 'function')
  })

  it('should do nothing if the response is ok', async () => {
    await checkResponse('', {}, { ok: true })
  })

  it('should reject if the response is not ok', async () => {
    const res = {
      ok: false,
      text: async () => 'test'
    }

    await rejects(checkResponse('', {}, res), {
      message: /can't/
    })
  })

  it('should reject with a read message error for the default method', async () => {
    const res = {
      ok: false,
      status: 500,
      text: async () => 'test'
    }

    await rejects(checkResponse('http://example.org/resource', {}, res), {
      message: 'can\'t read data from <http://example.org/resource>[500]: test'
    })
  })

  it('should reject with a write message error for the PUT method', async () => {
    const res = {
      ok: false,
      status: 500,
      text: async () => 'test'
    }

    await rejects(checkResponse('http://example.org/resource', { method: 'PUT' }, res), {
      message: 'can\'t write data to <http://example.org/resource>[500]: test'
    })
  })
})
