/**
 * Misc tests.
 */
// disable so tests can be copy & pasted
/* eslint-disable quotes, quote-props */
const assert = require('assert');
const graphs = require('./graphs.js');
const rdfCanonize = require('..');

describe('API tests', () => {
  it('should reject no algorithm', async () => {
    let error;
    try {
      await rdfCanonize.canonize([]);
    } catch(e) {
      error = e;
    }
    assert(error);
    assert.match(error.message,
      /No RDF Dataset Canonicalization algorithm specified./);
  });

  it('should reject invalid algorithm', async () => {
    let error;
    try {
      await rdfCanonize.canonize([], {
        algorithm: 'bogus'
      });
    } catch(e) {
      error = e;
    }
    assert(error);
    assert.match(error.message,
      /Invalid RDF Dataset Canonicalization algorithm/);
  });

  it('should reject invalid inputFormat', async () => {
    let error;
    try {
      await rdfCanonize.canonize('', {
        algorithm: 'RDFC-1.0',
        inputFormat: 'application/bogus'
      });
    } catch(e) {
      error = e;
    }
    assert(error);
    assert.match(error.message, /Unknown canonicalization input format/);
  });

  it('should handle falsy inputFormat', async () => {
    const input = [];
    const expected = '';
    const output = await rdfCanonize.canonize(input, {
      algorithm: 'RDFC-1.0',
      inputFormat: null
    });
    assert.deepStrictEqual(output, expected);
  });

  it('should reject invalid messageDigestAlgorithm', async () => {
    let error;
    try {
      const input = '_:b0 <ex:p> _:b1 .';
      await rdfCanonize.canonize(input, {
        algorithm: 'RDFC-1.0',
        inputFormat: 'application/n-quads',
        messageDigestAlgorithm: 'bogus'
      });
    } catch(e) {
      error = e;
    }
    assert(error);
    assert.match(error.message, /Unsupported algorithm/);
  });

  it('should reject invalid output format', async () => {
    let error;
    try {
      await rdfCanonize.canonize([], {
        algorithm: 'RDFC-1.0',
        format: 'bogus'
      });
    } catch(e) {
      error = e;
    }
    assert(error);
    assert.match(error.message, /Unknown canonicalization output format/);
  });

  it('should handle valid output format', async () => {
    const input = [];
    const expected = '';
    const output = await rdfCanonize.canonize(input, {
      algorithm: 'RDFC-1.0',
      format: 'application/n-quads'
    });
    assert.deepStrictEqual(output, expected);
  });

  it('should handle falsy output format', async () => {
    const input = [];
    const expected = '';
    const output = await rdfCanonize.canonize(input, {
      algorithm: 'RDFC-1.0',
      inputFormat: null,
      format: null
    });
    assert.deepStrictEqual(output, expected);
  });

  it('should fail to parse empty dataset as N-Quads', async () => {
    let error;
    try {
      await rdfCanonize.canonize([], {
        algorithm: 'RDFC-1.0',
        inputFormat: 'application/n-quads'
      });
    } catch(e) {
      error = e;
    }
    assert(error);
    assert.match(error.message, /N-Quads input must be a string./);
  });

  it('should set canonicalIdMap data', async () => {
    const input = `\
_:b0 <urn:p0> _:b1 .
_:b1 <urn:p1> "v1" .
`;
    const expected = `\
_:c14n0 <urn:p0> _:c14n1 .
_:c14n1 <urn:p1> "v1" .
`;
    const expectIdMap = new Map(Object.entries({
      'b0': 'c14n0',
      'b1': 'c14n1'
    }));

    const canonicalIdMap = new Map();
    const output = await rdfCanonize.canonize(input, {
      algorithm: 'RDFC-1.0',
      inputFormat: 'application/n-quads',
      canonicalIdMap
    });
    assert.deepStrictEqual(output, expected);
    assert.deepStrictEqual(canonicalIdMap, expectIdMap);
  });

  it('should allow URDNA2015 by default', async () => {
    await rdfCanonize.canonize([], {
      algorithm: 'URDNA2015'
    });
  });

  it('should handle rejectURDNA2015 option', async () => {
    let error;
    try {
      await rdfCanonize.canonize([], {
        algorithm: 'URDNA2015',
        rejectURDNA2015: true
      });
    } catch(e) {
      error = e;
    }
    assert(error);
    assert.match(error.message,
      /Invalid RDF Dataset Canonicalization algorithm/);
  });

  it('should abort (timeout)', async () => {
    const {data} = graphs.makeDataC({
      counts: [10, 10, 10]
    });
    let error;
    let output;
    try {
      output = await rdfCanonize.canonize(data, {
        algorithm: 'RDFC-1.0',
        inputFormat: 'application/n-quads',
        signal: AbortSignal.timeout(100),
        maxDeepIterations: Infinity
      });
    } catch(e) {
      error = e;
    }
    assert(error, 'no abort error');
    assert.match(error.message, /Abort signal received/);
    assert.match(error.message, /TimeoutError/);
    assert(!output, 'abort should have no output');
  });

  it('should abort (work factor = 0)', async () => {
    const {data} = graphs.makeDataA({
      subjects: 2,
      objects: 2
    });
    let error;
    let output;
    try {
      output = await rdfCanonize.canonize(data, {
        algorithm: 'RDFC-1.0',
        inputFormat: 'application/n-quads',
        signal: null,
        maxWorkFactor: 0
      });
    } catch(e) {
      error = e;
    }
    assert(error, 'no abort error');
    assert(!output, 'abort should have no output');
  });

  it('should abort (work factor = 1)', async () => {
    const {data} = graphs.makeDataA({
      subjects: 3,
      objects: 3
    });
    let error;
    let output;
    try {
      output = await rdfCanonize.canonize(data, {
        algorithm: 'RDFC-1.0',
        inputFormat: 'application/n-quads',
        signal: null,
        maxWorkFactor: 1
      });
    } catch(e) {
      error = e;
    }
    assert(error, 'no abort error');
    assert(!output, 'abort should have no output');
  });

  it('should not abort (work factor = Infinity)', async () => {
    const {data} = graphs.makeDataA({
      subjects: 3,
      objects: 3
    });
    await rdfCanonize.canonize(data, {
      algorithm: 'RDFC-1.0',
      inputFormat: 'application/n-quads',
      maxWorkFactor: Infinity
    });
  });

  it('should not abort (work factor = 1, max iterations set)', async () => {
    const {data} = graphs.makeDataA({
      subjects: 3,
      objects: 3
    });
    await rdfCanonize.canonize(data, {
      algorithm: 'RDFC-1.0',
      inputFormat: 'application/n-quads',
      maxWorkFactor: 1,
      maxDeepIterations: 33
    });
  });

  it('should abort (iterations [max deep = 0])', async () => {
    const {data} = graphs.makeDataA({
      subjects: 2,
      objects: 2
    });
    let error;
    let output;
    try {
      output = await rdfCanonize.canonize(data, {
        algorithm: 'RDFC-1.0',
        inputFormat: 'application/n-quads',
        maxDeepIterations: 0
      });
    } catch(e) {
      error = e;
    }
    assert(error, 'no abort error');
    assert.match(error.message, /Maximum deep iterations exceeded/);
    assert(!output, 'abort should have no output');
  });

  it('should abort (iterations [max work factor = 0])', async () => {
    const {data} = graphs.makeDataA({
      subjects: 2,
      objects: 2
    });
    let error;
    let output;
    try {
      output = await rdfCanonize.canonize(data, {
        algorithm: 'RDFC-1.0',
        inputFormat: 'application/n-quads',
        maxWorkFactor: 0
      });
    } catch(e) {
      error = e;
    }
    assert(error, 'no abort error');
    assert.match(error.message, /Maximum deep iterations exceeded/);
    assert(!output, 'abort should have no output');
  });

  it('should abort (iterations [max deep = 1000])', async () => {
    const {data} = graphs.makeDataA({
      subjects: 6,
      objects: 6
    });
    let error;
    let output;
    try {
      output = await rdfCanonize.canonize(data, {
        algorithm: 'RDFC-1.0',
        inputFormat: 'application/n-quads',
        maxDeepIterations: 1000
      });
    } catch(e) {
      error = e;
    }
    assert(error, 'no abort error');
    assert.match(error.message, /Maximum deep iterations exceeded/);
    assert(!output, 'abort should have no output');
  });

  /*
  it.only('should abort (playground)', async () => {
    //const {data, n} = graphs.makeDataA({
    //  subjects: 6,
    //  objects: 6
    //});
    //const {data, n} = graphs.makeDataB({
    //  subjects: 6
    //});
    const {data, n} = graphs.makeDataC({
      counts: [10, 10, 10]
    });
    console.log('INPUT', data);
    console.log('INPUTN', n);
    console.log('INPUTSIZE', data.length);
    let error;
    let output;
    const start = performance.now();
    try {
      const p = rdfCanonize.canonize(data, {
        algorithm: 'RDFC-1.0',
        inputFormat: 'application/n-quads',
        format: 'application/n-quads',
        //signal: AbortSignal.timeout(1000),
        //maxWorkFactor: 3
        //maxDeepIterations: 9
      });
      output = await p;
      //console.log('OUTPUT', output);
    } catch(e) {
      console.log('ERROR', e);
      error = e;
    }
    const dt = performance.now() - start;
    console.log('DT(ms)', dt);
    assert(error, 'no abort error');
    assert(!output, 'abort should have no output');
  });
  */

  it('should serialize generalized RDF', async () => {
    const input =
[
  {
    subject: {termType: 'BlankNode', value: 'b0'},
    predicate: {termType: 'BlankNode', value: 'b1'},
    object: {termType: 'BlankNode', value: 'b2'},
    graph: {termType: 'DefaultGraph', value: ''}
  }
]
;
    const expected = `\
_:b0 _:b1 _:b2 .
`;

    const output = rdfCanonize.NQuads.serialize(input);
    assert.deepStrictEqual(output, expected);
  });

  it('should handle duplicate quads', async () => {
    const input = `\
_:b0 <ex:p> _:b1 .
_:b0 <ex:p> _:b1 .
`;
    const expected = `\
_:c14n1 <ex:p> _:c14n0 .
`;

    const output = await rdfCanonize.canonize(input, {
      algorithm: 'RDFC-1.0',
      inputFormat: 'application/n-quads'
    });
    assert.deepStrictEqual(output, expected);
  });

  it('should fail on invalid N-Quads', async () => {
    const input = `\
_:b0 <ex:p> .
`;
    let error;
    let output;
    try {
      output = await rdfCanonize.canonize(input, {
        algorithm: 'RDFC-1.0',
        inputFormat: 'application/n-quads'
      });
    } catch(e) {
      error = e;
    }
    assert(error, 'no abort error');
    assert.match(error.message, /N-Quads parse error/);
    assert(!output, 'abort should have no output');
  });

  it.skip('should escape IRI', async () => {
    // FIXME: determine what inputs trigger escaping code
    const input =
[
  {
    subject: {termType: 'NamedNode', value: 'ex:s'},
    predicate: {termType: 'NamedNode', value: 'ex:p'},
    object: {termType: 'NamedNode', value: 'ex:o'},
    graph: {termType: 'NamedNode', value: 'ex:g'}
  }
]
;
    const expected = `\
<ex:s> <ex:p> <ex:o> <ex:g>.
`;

    const output = await rdfCanonize.canonize(input, {
      algorithm: 'RDFC-1.0'
    });
    assert.deepStrictEqual(output, expected);
  });
});
