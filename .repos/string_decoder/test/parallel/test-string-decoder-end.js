// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var bufferShim = require('safe-buffer').Buffer;
// verify that the string decoder works getting 1 byte at a time,
// the whole buffer at once, and that both match the .toString(enc)
// result of the entire buffer.

require('../common');
var assert = require('assert');
var SD = require('../../').StringDecoder;
var encodings = ['base64', 'hex', 'utf8', 'utf16le', 'ucs2'];

var bufs = ['☃💩', 'asdf'].map(function (b) {
  return bufferShim.from(b);
});

// also test just arbitrary bytes from 0-15.
for (var i = 1; i <= 16; i++) {
  var bytes = '.'.repeat(i - 1).split('.').map(function (_, j) {
    return j + 0x78;
  });
  bufs.push(bufferShim.from(bytes));
}

encodings.forEach(testEncoding);

function testEncoding(encoding) {
  bufs.forEach(function (buf) {
    testBuf(encoding, buf);
  });
}

function testBuf(encoding, buf) {
  // write one byte at a time.
  var s = new SD(encoding);
  var res1 = '';
  for (var _i = 0; _i < buf.length; _i++) {
    res1 += s.write(buf.slice(_i, _i + 1));
  }
  res1 += s.end();

  // write the whole buffer at once.
  var res2 = '';
  s = new SD(encoding);
  res2 += s.write(buf);
  res2 += s.end();

  // .toString() on the buffer
  var res3 = buf.toString(encoding);

  assert.strictEqual(res1, res3, 'one byte at a time should match toString');
  assert.strictEqual(res2, res3, 'all bytes at once should match toString');
}