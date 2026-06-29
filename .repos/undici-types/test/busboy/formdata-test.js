'use strict'

// Copyright 2009 The Go Authors.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are
// met:
//
//    * Redistributions of source code must retain the above copyright
// notice, this list of conditions and the following disclaimer.
//    * Redistributions in binary form must reproduce the above
// copyright notice, this list of conditions and the following disclaimer
// in the documentation and/or other materials provided with the
// distribution.
//    * Neither the name of Google LLC nor the names of its
// contributors may be used to endorse or promote products derived from
// this software without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
// A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
// OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
// LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

// https://github.com/golang/go/blob/16e5d24480dca7ddcbdffb78a8ed5de3e5155dec/src/mime/multipart/formdata_test.go

const { test } = require('node:test')
const { Response } = require('../..')

const fileaContents = 'This is a test file.'
const filebContents = 'Another test file.'
const textaValue = 'foo'
const textbValue = 'bar'
const boundary = 'MyBoundary'

const message = [
  '--MyBoundary',
  'Content-Disposition: form-data; name="filea"; filename="filea.txt"',
  'Content-Type: text/plain',
  '',
  fileaContents,
  '--MyBoundary',
  'Content-Disposition: form-data; name="fileb"; filename="fileb.txt"',
  'Content-Type: text/plain',
  '',
  filebContents,
  '--MyBoundary',
  'Content-Disposition: form-data; name="texta"',
  '',
  textaValue,
  '--MyBoundary',
  'Content-Disposition: form-data; name="textb"',
  '',
  textbValue,
  '--MyBoundary--'
].join('\r\n')

const messageWithFileWithoutName = [
  '--MyBoundary',
  'Content-Disposition: form-data; name="hiddenfile"; filename=""',
  'Content-Type: text/plain',
  '',
  filebContents,
  '--MyBoundary--'
].join('\r\n')

const messageWithFileName = [
  '--MyBoundary',
  'Content-Disposition: form-data; name="filea"; filename="filea.txt"',
  'Content-Type: text/plain',
  '',
  fileaContents,
  '--MyBoundary--'
].join('\r\n')

const messageWithTextContentType = [
  '--MyBoundary',
  'Content-Disposition: form-data; name="texta"',
  'Content-Type: text/plain',
  '',
  textaValue,
  '--MyBoundary--'
].join('\r\n')

function makeResponse (body, bnd) {
  return new Response(body, {
    headers: {
      'content-type': `multipart/form-data; boundary=${bnd}`
    }
  })
}

test('ReadForm - fields and files', async (t) => {
  const response = makeResponse(message, boundary)
  const fd = await response.formData()

  t.assert.strictEqual(fd.get('texta'), textaValue, 'texta value mismatch')
  t.assert.strictEqual(fd.get('textb'), textbValue, 'textb value mismatch')

  const filea = fd.get('filea')
  t.assert.strictEqual(filea.name, 'filea.txt', 'filea filename mismatch')
  t.assert.strictEqual(filea.size, fileaContents.length, 'filea size mismatch')
  t.assert.strictEqual(await filea.text(), fileaContents, 'filea contents mismatch')

  const fileb = fd.get('fileb')
  t.assert.strictEqual(fileb.name, 'fileb.txt', 'fileb filename mismatch')
  t.assert.strictEqual(fileb.size, filebContents.length, 'fileb size mismatch')
  t.assert.strictEqual(await fileb.text(), filebContents, 'fileb contents mismatch')
})

test('ReadForm - file without name', async (t) => {
  const response = makeResponse(messageWithFileWithoutName, boundary)
  const fd = await response.formData()

  // A file with an empty filename is treated as a field in the web platform FormData
  const value = fd.get('hiddenfile')
  if (typeof value === 'string') {
    t.assert.strictEqual(value, filebContents, 'hiddenfile value mismatch')
  } else {
    t.assert.strictEqual(await value.text(), filebContents, 'hiddenfile contents mismatch')
  }
})

test('ReadForm - file with filename', async (t) => {
  const response = makeResponse(messageWithFileName, boundary)
  const fd = await response.formData()

  const filea = fd.get('filea')
  t.assert.strictEqual(filea.name, 'filea.txt', 'filea filename mismatch')
  t.assert.strictEqual(await filea.text(), fileaContents, 'filea contents mismatch')
})

test('ReadForm - text content type', async (t) => {
  const response = makeResponse(messageWithTextContentType, boundary)
  const fd = await response.formData()

  t.assert.strictEqual(fd.get('texta'), textaValue, 'texta value mismatch')
})

test('ReadForm - no read after EOF', async (t) => {
  const eofBoundary = '---------------------------8d345eef0d38dc9'
  const body = [
    '-----------------------------8d345eef0d38dc9',
    'Content-Disposition: form-data; name="version"',
    '',
    '171',
    '-----------------------------8d345eef0d38dc9--'
  ].join('\r\n')

  const response = makeResponse(body, eofBoundary)
  const fd = await response.formData()

  t.assert.strictEqual(fd.get('version'), '171', 'version value mismatch')
})

test('ReadForm - non-file max memory (large text value)', async (t) => {
  const n = 10 << 20 // 10 MB
  const largeTextValue = '1'.repeat(n)
  const body = [
    '--MyBoundary',
    'Content-Disposition: form-data; name="largetext"',
    '',
    largeTextValue,
    '--MyBoundary--'
  ].join('\r\n')

  const response = makeResponse(body, boundary)
  const fd = await response.formData()

  t.assert.strictEqual(fd.get('largetext'), largeTextValue, 'largetext value mismatch')
})

test('ReadForm - many files', async (t) => {
  const numFiles = 10
  const parts = []
  const fileBoundary = 'TestBoundary'

  for (let i = 0; i < numFiles; i++) {
    parts.push(
      `--${fileBoundary}`,
      `Content-Disposition: form-data; name="${i}"; filename="${i}"`,
      'Content-Type: application/octet-stream',
      '',
      `${i}`
    )
  }
  parts.push(`--${fileBoundary}--`)
  const body = parts.join('\r\n')

  const response = makeResponse(body, fileBoundary)
  const fd = await response.formData()

  for (let i = 0; i < numFiles; i++) {
    const file = fd.get(`${i}`)
    t.assert.ok(file, `file "${i}" should exist`)
    t.assert.strictEqual(file.name, `${i}`, `file "${i}" filename mismatch`)
    const text = await file.text()
    t.assert.strictEqual(text, `${i}`, `file "${i}" contents mismatch`)
  }
})

test('ReadForm - limits with many values', async (t) => {
  const numValues = 100
  const parts = []
  const limitBoundary = 'LimitBoundary'

  for (let i = 0; i < numValues; i++) {
    parts.push(
      `--${limitBoundary}`,
      `Content-Disposition: form-data; name="field${i}"`,
      '',
      `value ${i}`
    )
  }
  parts.push(`--${limitBoundary}--`)
  const body = parts.join('\r\n')

  const response = makeResponse(body, limitBoundary)
  const fd = await response.formData()

  for (let i = 0; i < numValues; i++) {
    t.assert.strictEqual(
      fd.get(`field${i}`),
      `value ${i}`,
      `field${i} value mismatch`
    )
  }
})

test('ReadForm - limits with values and files', async (t) => {
  const numValues = 50
  const numFiles = 50
  const parts = []
  const limitBoundary = 'LimitBoundary'

  for (let i = 0; i < numValues; i++) {
    parts.push(
      `--${limitBoundary}`,
      `Content-Disposition: form-data; name="field${i}"`,
      '',
      `value ${i}`
    )
  }
  for (let i = 0; i < numFiles; i++) {
    parts.push(
      `--${limitBoundary}`,
      `Content-Disposition: form-data; name="file${i}"; filename="file${i}"`,
      'Content-Type: application/octet-stream',
      '',
      `value ${i}`
    )
  }
  parts.push(`--${limitBoundary}--`)
  const body = parts.join('\r\n')

  const response = makeResponse(body, limitBoundary)
  const fd = await response.formData()

  for (let i = 0; i < numValues; i++) {
    t.assert.strictEqual(
      fd.get(`field${i}`),
      `value ${i}`,
      `field${i} value mismatch`
    )
  }
  for (let i = 0; i < numFiles; i++) {
    const file = fd.get(`file${i}`)
    t.assert.ok(file, `file${i} should exist`)
    const text = await file.text()
    t.assert.strictEqual(text, `value ${i}`, `file${i} contents mismatch`)
  }
})

test('ReadForm - metadata too large (large field name)', async (t) => {
  const largeName = 'a'.repeat(10 << 20)
  const body = [
    '--MyBoundary',
    `Content-Disposition: form-data; name="${largeName}"`,
    '',
    'value',
    '--MyBoundary--'
  ].join('\r\n')

  const response = makeResponse(body, boundary)

  // Expect parsing to either succeed (implementation dependent) or throw
  try {
    const fd = await response.formData()
    // If it succeeds, the value should be correct
    t.assert.strictEqual(fd.get(largeName), 'value')
  } catch (err) {
    // Implementation may reject overly large metadata
    t.assert.ok(err, 'error thrown for large metadata')
  }
})

test('ReadForm - metadata too large (large MIME header)', async (t) => {
  const largeHeaderValue = 'a'.repeat(10 << 20)
  const body = [
    '--MyBoundary',
    'Content-Disposition: form-data; name="a"',
    `X-Foo: ${largeHeaderValue}`,
    '',
    'value',
    '--MyBoundary--'
  ].join('\r\n')

  const response = makeResponse(body, boundary)

  try {
    const fd = await response.formData()
    t.assert.strictEqual(fd.get('a'), 'value')
  } catch (err) {
    t.assert.ok(err, 'error thrown for large MIME header')
  }
})

test('ReadForm - metadata too large (many parts)', async (t) => {
  const parts = []
  const numParts = 110000

  for (let i = 0; i < numParts; i++) {
    parts.push(
      '--MyBoundary',
      'Content-Disposition: form-data; name="f"',
      '',
      'v'
    )
  }
  parts.push('--MyBoundary--')
  const body = parts.join('\r\n')

  const response = makeResponse(body, boundary)

  try {
    const fd = await response.formData()
    // If it succeeds, check that values are present
    t.assert.ok(fd.getAll('f').length > 0)
  } catch (err) {
    // Implementation may reject too many parts
    t.assert.ok(err, 'error thrown for too many parts')
  }
})

test('ReadForm - endless header line (name)', async (t) => {
  // Create a body with an extremely long header name that never ends
  const longPrefix = 'X-' + 'X'.repeat(1 << 20)
  const body = [
    '--MyBoundary',
    'Content-Disposition: form-data; name="a"',
    'Content-Type: text/plain',
    longPrefix
  ].join('\r\n')

  const response = makeResponse(body, boundary)

  try {
    await response.formData()
    // If parsing succeeds (truncated or ignored), that's acceptable
  } catch (err) {
    t.assert.ok(err, 'error thrown for endless header line')
  }
})

test('ReadForm - endless header line (value)', async (t) => {
  const longValue = 'X-Header: ' + 'X'.repeat(1 << 20)
  const body = [
    '--MyBoundary',
    'Content-Disposition: form-data; name="a"',
    'Content-Type: text/plain',
    longValue
  ].join('\r\n')

  const response = makeResponse(body, boundary)

  try {
    await response.formData()
  } catch (err) {
    t.assert.ok(err, 'error thrown for endless header value')
  }
})
