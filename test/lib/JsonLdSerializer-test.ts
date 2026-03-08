import {DataFactory} from "rdf-data-factory";
import {PassThrough} from "stream";
import {JsonLdSerializer} from "../../lib/JsonLdSerializer";

// tslint:disable:no-var-requires
const stringifyStream = require('stream-to-string');
const streamifyArray = require('streamify-array');

const DF = new DataFactory();

// tslint:disable:object-literal-sort-keys
describe('JsonLdSerializer', () => {

  let serializer: JsonLdSerializer;

  beforeEach(() => {
    serializer = new JsonLdSerializer();
  });

  it('should serialize an empty stream', async () => {
    const quads = [];
    return expect(await serialize(quads)).toEqual(
      [
      ],
    );
  });

  it('should serialize a single triple', async () => {
    const quads = [
      DF.quad(DF.namedNode('http://ex.org/myid'), DF.namedNode('http://ex.org/pred1'), DF.namedNode('http://ex.org/obj1')),
    ];
    return expect(await serialize(quads)).toEqual(
      [
        {
          "@id": "http://ex.org/myid",
          "http://ex.org/pred1": [
            { "@id": "http://ex.org/obj1" },
          ],
        },
      ]);
  });

  it('should serialize a single triple with blank node subject', async () => {
    const quads = [
      DF.quad(DF.blankNode('b1'), DF.namedNode('http://ex.org/pred1'), DF.namedNode('http://ex.org/obj1')),
    ];
    return expect(await serialize(quads)).toEqual(
      [
        {
          "@id": "_:b1",
          "http://ex.org/pred1": [
            { "@id": "http://ex.org/obj1" },
          ],
        },
      ]);
  });

  it('should serialize two triples with different subjects and predicates', async () => {
    const quads = [
      DF.quad(DF.namedNode('http://ex.org/myid1'), DF.namedNode('http://ex.org/pred1'), DF.namedNode('http://ex.org/obj1')),
      DF.quad(DF.namedNode('http://ex.org/myid2'), DF.namedNode('http://ex.org/pred2'), DF.namedNode('http://ex.org/obj1')),
    ];
    return expect(await serialize(quads)).toEqual(
      [
        {
          "@id": "http://ex.org/myid1",
          "http://ex.org/pred1": [
            { "@id": "http://ex.org/obj1" },
          ],
        },
        {
          "@id": "http://ex.org/myid2",
          "http://ex.org/pred2": [
            { "@id": "http://ex.org/obj1" },
          ],
        },
      ]);
  });

  it('should serialize two triples with different subjects but equal predicates', async () => {
    const quads = [
      DF.quad(DF.namedNode('http://ex.org/myid1'), DF.namedNode('http://ex.org/pred1'), DF.namedNode('http://ex.org/obj1')),
      DF.quad(DF.namedNode('http://ex.org/myid2'), DF.namedNode('http://ex.org/pred1'), DF.namedNode('http://ex.org/obj1')),
    ];
    return expect(await serialize(quads)).toEqual(
      [
        {
          "@id": "http://ex.org/myid1",
          "http://ex.org/pred1": [
            { "@id": "http://ex.org/obj1" },
          ],
        },
        {
          "@id": "http://ex.org/myid2",
          "http://ex.org/pred1": [
            { "@id": "http://ex.org/obj1" },
          ],
        },
      ]);
  });

  it('should serialize two triples with equal subjects but different predicates', async () => {
    const quads = [
      DF.quad(DF.namedNode('http://ex.org/myid1'), DF.namedNode('http://ex.org/pred1'), DF.namedNode('http://ex.org/obj1')),
      DF.quad(DF.namedNode('http://ex.org/myid1'), DF.namedNode('http://ex.org/pred2'), DF.namedNode('http://ex.org/obj1')),
    ];
    return expect(await serialize(quads)).toEqual(
      [
        {
          "@id": "http://ex.org/myid1",
          "http://ex.org/pred1": [
            { "@id": "http://ex.org/obj1" },
          ],
          "http://ex.org/pred2": [
            { "@id": "http://ex.org/obj1" },
          ],
        },
      ]);
  });

  it('should serialize two triples with equal subjects and predicates', async () => {
    const quads = [
      DF.quad(DF.namedNode('http://ex.org/myid1'), DF.namedNode('http://ex.org/pred1'), DF.namedNode('http://ex.org/obj1')),
      DF.quad(DF.namedNode('http://ex.org/myid1'), DF.namedNode('http://ex.org/pred1'), DF.namedNode('http://ex.org/obj2')),
    ];
    return expect(await serialize(quads)).toEqual(
      [
        {
          "@id": "http://ex.org/myid1",
          "http://ex.org/pred1": [
            { "@id": "http://ex.org/obj1" },
            { "@id": "http://ex.org/obj2" },
          ],
        },
      ]);
  });

  it('should serialize rdf:type predicates to @type with compacted object IRIs', async () => {
    const quads = [
      DF.quad(DF.namedNode('http://ex.org/myid1'), DF.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
        DF.namedNode('http://ex.org/obj1')),
    ];
    return expect(await serialize(quads)).toEqual(
      [
        {
          "@id": "http://ex.org/myid1",
          "@type": [
            "http://ex.org/obj1",
          ],
        },
      ]);
  });

  it('should not serialize rdf:type predicates to @type if useRdfType is true', async () => {
    const customSerializer = new JsonLdSerializer({ useRdfType: true });
    const quads = [
      DF.quad(DF.namedNode('http://ex.org/myid1'), DF.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
        DF.namedNode('http://ex.org/obj1')),
    ];
    return expect(await serialize(quads, customSerializer)).toEqual(
      [
        {
          "@id": "http://ex.org/myid1",
          "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": [
            { "@id": "http://ex.org/obj1" },
          ],
        },
      ]);
  });

  it('should serialize string literals', async () => {
    const quads = [
      DF.quad(DF.namedNode('http://ex.org/myid1'), DF.namedNode('http://ex.org/pred1'), DF.literal('abc')),
      DF.quad(DF.namedNode('http://ex.org/myid1'), DF.namedNode('http://ex.org/pred1'), DF.literal('def')),
    ];
    return expect(await serialize(quads)).toEqual(
      [
        {
          "@id": "http://ex.org/myid1",
          "http://ex.org/pred1": [
            { "@value": "abc" },
            { "@value": "def" },
          ],
        },
      ]);
  });

  it('should serialize language-tagged literals', async () => {
    const quads = [
      DF.quad(DF.namedNode('http://ex.org/myid1'), DF.namedNode('http://ex.org/pred1'), DF.literal('abc', 'en')),
      DF.quad(DF.namedNode('http://ex.org/myid1'), DF.namedNode('http://ex.org/pred1'), DF.literal('def', 'nl')),
    ];
    return expect(await serialize(quads)).toEqual(
      [
        {
          "@id": "http://ex.org/myid1",
          "http://ex.org/pred1": [
            { "@value": "abc", "@language": "en" },
            { "@value": "def", "@language": "nl" },
          ],
        },
      ]);
  });

  it('should serialize literals with unknown type', async () => {
    const quads = [
      DF.quad(DF.namedNode('http://ex.org/myid1'), DF.namedNode('http://ex.org/pred1'),
        DF.literal('abc', DF.namedNode('http://ex.org/type'))),
      DF.quad(DF.namedNode('http://ex.org/myid1'), DF.namedNode('http://ex.org/pred1'),
        DF.literal('def', DF.namedNode('http://ex.org/type'))),
    ];
    return expect(await serialize(quads)).toEqual(
      [
        {
          "@id": "http://ex.org/myid1",
          "http://ex.org/pred1": [
            { "@value": "abc", "@type": "http://ex.org/type" },
            { "@value": "def", "@type": "http://ex.org/type" },
          ],
        },
      ]);
  });

  it('should serialize literals with integer type', async () => {
    const quads = [
      DF.quad(DF.namedNode('http://ex.org/myid1'), DF.namedNode('http://ex.org/pred1'),
        DF.literal('10', DF.namedNode('http://www.w3.org/2001/XMLSchema#integer'))),
      DF.quad(DF.namedNode('http://ex.org/myid1'), DF.namedNode('http://ex.org/pred1'),
        DF.literal('20', DF.namedNode('http://www.w3.org/2001/XMLSchema#integer'))),
    ];
    return expect(await serialize(quads)).toEqual(
      [
        {
          "@id": "http://ex.org/myid1",
          "http://ex.org/pred1": [
            { "@value": "10", "@type": "http://www.w3.org/2001/XMLSchema#integer" },
            { "@value": "20", "@type": "http://www.w3.org/2001/XMLSchema#integer" },
          ],
        },
      ]);
  });

  it('should serialize literals with integer type when useNativeTypes is true', async () => {
    const customSerializer = new JsonLdSerializer({ useNativeTypes: true });
    const quads = [
      DF.quad(DF.namedNode('http://ex.org/myid1'), DF.namedNode('http://ex.org/pred1'),
        DF.literal('10', DF.namedNode('http://www.w3.org/2001/XMLSchema#integer'))),
      DF.quad(DF.namedNode('http://ex.org/myid1'), DF.namedNode('http://ex.org/pred1'),
        DF.literal('20', DF.namedNode('http://www.w3.org/2001/XMLSchema#integer'))),
    ];
    return expect(await serialize(quads, customSerializer)).toEqual(
      [
        {
          "@id": "http://ex.org/myid1",
          "http://ex.org/pred1": [
            { "@value": 10 },
            { "@value": 20 },
          ],
        },
      ]);
  });

  it('should fail to serialize invalid literals with integer type when useNativeTypes is true', async () => {
    const customSerializer = new JsonLdSerializer({ useNativeTypes: true });
    const quads = [
      DF.quad(DF.namedNode('http://ex.org/myid1'), DF.namedNode('http://ex.org/pred1'),
        DF.literal('abc', DF.namedNode('http://www.w3.org/2001/XMLSchema#integer'))),
    ];
    return expect(serialize(quads, customSerializer)).rejects.toThrow(new Error('Invalid xsd:integer value \'abc\''));
  });

  it('should serialize a single quad in a custom graph', async () => {
    const quads = [
      DF.quad(DF.blankNode('b1'), DF.namedNode('http://ex.org/pred1'),
        DF.namedNode('http://ex.org/obj1'), DF.namedNode('http://ex.org/mygraph1')),
    ];
    return expect(await serialize(quads)).toEqual(
      [
        {
          "@id": "http://ex.org/mygraph1",
          "@graph": [
            {
              "@id": "_:b1",
              "http://ex.org/pred1": [
                { "@id": "http://ex.org/obj1" },
              ],
            },
          ],
        },
      ]);
  });

  it('should serialize two quads in a the same graph, with equal subject and predicate', async () => {
    const quads = [
      DF.quad(DF.blankNode('b1'), DF.namedNode('http://ex.org/pred1'),
        DF.namedNode('http://ex.org/obj1'), DF.namedNode('http://ex.org/mygraph1')),
      DF.quad(DF.blankNode('b1'), DF.namedNode('http://ex.org/pred1'),
        DF.namedNode('http://ex.org/obj2'), DF.namedNode('http://ex.org/mygraph1')),
    ];
    return expect(await serialize(quads)).toEqual(
      [
        {
          "@id": "http://ex.org/mygraph1",
          "@graph": [
            {
              "@id": "_:b1",
              "http://ex.org/pred1": [
                { "@id": "http://ex.org/obj1" },
                { "@id": "http://ex.org/obj2" },
              ],
            },
          ],
        },
      ]);
  });

  it('should serialize two quads in a the same graph, with equal subject and different predicate', async () => {
    const quads = [
      DF.quad(DF.blankNode('b1'), DF.namedNode('http://ex.org/pred1'),
        DF.namedNode('http://ex.org/obj1'), DF.namedNode('http://ex.org/mygraph1')),
      DF.quad(DF.blankNode('b1'), DF.namedNode('http://ex.org/pred2'),
        DF.namedNode('http://ex.org/obj1'), DF.namedNode('http://ex.org/mygraph1')),
    ];
    return expect(await serialize(quads)).toEqual(
      [
        {
          "@id": "http://ex.org/mygraph1",
          "@graph": [
            {
              "@id": "_:b1",
              "http://ex.org/pred1": [
                { "@id": "http://ex.org/obj1" },
              ],
              "http://ex.org/pred2": [
                { "@id": "http://ex.org/obj1" },
              ],
            },
          ],
        },
      ]);
  });

  it('should serialize two quads in a the same graph, with different subject and predicate', async () => {
    const quads = [
      DF.quad(DF.blankNode('b1'), DF.namedNode('http://ex.org/pred1'),
        DF.namedNode('http://ex.org/obj1'), DF.namedNode('http://ex.org/mygraph1')),
      DF.quad(DF.blankNode('b2'), DF.namedNode('http://ex.org/pred1'),
        DF.namedNode('http://ex.org/obj1'), DF.namedNode('http://ex.org/mygraph1')),
    ];
    return expect(await serialize(quads)).toEqual(
      [
        {
          "@id": "http://ex.org/mygraph1",
          "@graph": [
            {
              "@id": "_:b1",
              "http://ex.org/pred1": [
                { "@id": "http://ex.org/obj1" },
              ],
            },
            {
              "@id": "_:b2",
              "http://ex.org/pred1": [
                { "@id": "http://ex.org/obj1" },
              ],
            },
          ],
        },
      ]);
  });

  it('should serialize two equal triples in a different graph', async () => {
    const quads = [
      DF.quad(DF.blankNode('b1'), DF.namedNode('http://ex.org/pred1'),
        DF.namedNode('http://ex.org/obj1'), DF.namedNode('http://ex.org/mygraph1')),
      DF.quad(DF.blankNode('b1'), DF.namedNode('http://ex.org/pred1'),
        DF.namedNode('http://ex.org/obj1'), DF.namedNode('http://ex.org/mygraph2')),
    ];
    return expect(await serialize(quads)).toEqual(
      [
        {
          "@id": "http://ex.org/mygraph1",
          "@graph": [
            {
              "@id": "_:b1",
              "http://ex.org/pred1": [
                { "@id": "http://ex.org/obj1" },
              ],
            },
          ],
        },
        {
          "@id": "http://ex.org/mygraph2",
          "@graph": [
            {
              "@id": "_:b1",
              "http://ex.org/pred1": [
                { "@id": "http://ex.org/obj1" },
              ],
            },
          ],
        },
      ]);
  });

  it('should serialize two non-equal triples in a different graph', async () => {
    const quads = [
      DF.quad(DF.blankNode('b1'), DF.namedNode('http://ex.org/pred1'),
        DF.namedNode('http://ex.org/obj1'), DF.namedNode('http://ex.org/mygraph1')),
      DF.quad(DF.blankNode('b2'), DF.namedNode('http://ex.org/pred2'),
        DF.namedNode('http://ex.org/obj2'), DF.namedNode('http://ex.org/mygraph2')),
    ];
    return expect(await serialize(quads)).toEqual(
      [
        {
          "@id": "http://ex.org/mygraph1",
          "@graph": [
            {
              "@id": "_:b1",
              "http://ex.org/pred1": [
                { "@id": "http://ex.org/obj1" },
              ],
            },
          ],
        },
        {
          "@id": "http://ex.org/mygraph2",
          "@graph": [
            {
              "@id": "_:b2",
              "http://ex.org/pred2": [
                { "@id": "http://ex.org/obj2" },
              ],
            },
          ],
        },
      ]);
  });

  it('should serialize a triple followed by a quad', async () => {
    const quads = [
      DF.quad(DF.blankNode('b1'), DF.namedNode('http://ex.org/pred1'),
        DF.namedNode('http://ex.org/obj1')),
      DF.quad(DF.blankNode('b2'), DF.namedNode('http://ex.org/pred2'),
        DF.namedNode('http://ex.org/obj2'), DF.namedNode('http://ex.org/mygraph2')),
    ];
    return expect(await serialize(quads)).toEqual(
      [
        {
          "@id": "_:b1",
          "http://ex.org/pred1": [
            { "@id": "http://ex.org/obj1" },
          ],
        },
        {
          "@id": "http://ex.org/mygraph2",
          "@graph": [
            {
              "@id": "_:b2",
              "http://ex.org/pred2": [
                { "@id": "http://ex.org/obj2" },
              ],
            },
          ],
        },
      ]);
  });

  it('should serialize a quad followed by a triple', async () => {
    const quads = [
      DF.quad(DF.blankNode('b2'), DF.namedNode('http://ex.org/pred2'),
        DF.namedNode('http://ex.org/obj2'), DF.namedNode('http://ex.org/mygraph2')),
      DF.quad(DF.blankNode('b1'), DF.namedNode('http://ex.org/pred1'),
        DF.namedNode('http://ex.org/obj1')),
    ];
    return expect(await serialize(quads)).toEqual(
      [
        {
          "@id": "http://ex.org/mygraph2",
          "@graph": [
            {
              "@id": "_:b2",
              "http://ex.org/pred2": [
                { "@id": "http://ex.org/obj2" },
              ],
            },
          ],
        },
        {
          "@id": "_:b1",
          "http://ex.org/pred1": [
            { "@id": "http://ex.org/obj1" },
          ],
        },
      ]);
  });

  it('should serialize a quad with graph equal to last subject', async () => {
    const quads = [
      DF.quad(DF.namedNode('http://ex.org/mygraph1'), DF.namedNode('http://ex.org/pred1'),
        DF.namedNode('http://ex.org/obj1')),
      DF.quad(DF.blankNode('b2'), DF.namedNode('http://ex.org/pred2'),
        DF.namedNode('http://ex.org/obj2'), DF.namedNode('http://ex.org/mygraph1')),
    ];
    return expect(await serialize(quads)).toEqual(
      [
        {
          "@id": "http://ex.org/mygraph1",
          "http://ex.org/pred1": [
            { "@id": "http://ex.org/obj1" },
          ],
          "@graph": [
            {
              "@id": "_:b2",
              "http://ex.org/pred2": [
                { "@id": "http://ex.org/obj2" },
              ],
            },
          ],
        },
      ]);
  });

  it('should serialize a quad with graph equal to last subject followed by another triple in that graph', async () => {
    const quads = [
      DF.quad(DF.namedNode('http://ex.org/mygraph1'), DF.namedNode('http://ex.org/pred1'),
        DF.namedNode('http://ex.org/obj1')),
      DF.quad(DF.blankNode('b2'), DF.namedNode('http://ex.org/pred2'),
        DF.namedNode('http://ex.org/obj2'), DF.namedNode('http://ex.org/mygraph1')),
      DF.quad(DF.namedNode('http://ex.org/mysubject'), DF.namedNode('http://ex.org/pred1'),
        DF.namedNode('http://ex.org/obj1'), DF.namedNode('http://ex.org/mygraph1')),
    ];
    return expect(await serialize(quads)).toEqual(
      [
        {
          "@id": "http://ex.org/mygraph1",
          "http://ex.org/pred1": [
            { "@id": "http://ex.org/obj1" },
          ],
          "@graph": [
            {
              "@id": "_:b2",
              "http://ex.org/pred2": [
                { "@id": "http://ex.org/obj2" },
              ],
            },
            {
              "@id": "http://ex.org/mysubject",
              "http://ex.org/pred1": [
                { "@id": "http://ex.org/obj1" },
              ],
            },
          ],
        },
      ]);
  });

  it('should serialize a quad with graph equal to last subject followed by another triple', async () => {
    const quads = [
      DF.quad(DF.namedNode('http://ex.org/mygraph1'), DF.namedNode('http://ex.org/pred1'),
        DF.namedNode('http://ex.org/obj1')),
      DF.quad(DF.blankNode('b2'), DF.namedNode('http://ex.org/pred2'),
        DF.namedNode('http://ex.org/obj2'), DF.namedNode('http://ex.org/mygraph1')),
      DF.quad(DF.namedNode('http://ex.org/mysubject'), DF.namedNode('http://ex.org/pred1'),
        DF.namedNode('http://ex.org/obj1')),
    ];
    return expect(await serialize(quads)).toEqual(
      [
        {
          "@id": "http://ex.org/mygraph1",
          "http://ex.org/pred1": [
            { "@id": "http://ex.org/obj1" },
          ],
          "@graph": [
            {
              "@id": "_:b2",
              "http://ex.org/pred2": [
                { "@id": "http://ex.org/obj2" },
              ],
            },
          ],
        },
        {
          "@id": "http://ex.org/mysubject",
          "http://ex.org/pred1": [
            { "@id": "http://ex.org/obj1" },
          ],
        },
      ]);
  });

  it('should serialize a triple with subject equal to last named graph', async () => {
    const quads = [
      DF.quad(DF.blankNode('b2'), DF.namedNode('http://ex.org/pred2'),
        DF.namedNode('http://ex.org/obj2'), DF.namedNode('http://ex.org/mygraph1')),
      DF.quad(DF.namedNode('http://ex.org/mygraph1'), DF.namedNode('http://ex.org/pred1'),
        DF.namedNode('http://ex.org/obj1')),
    ];
    return expect(await serialize(quads)).toEqual(
      [
        {
          "@id": "http://ex.org/mygraph1",
          "@graph": [
            {
              "@id": "_:b2",
              "http://ex.org/pred2": [
                { "@id": "http://ex.org/obj2" },
              ],
            },
          ],
          "http://ex.org/pred1": [
            { "@id": "http://ex.org/obj1" },
          ],
        },
      ]);
  });

  it('should serialize a quad with graph equal to last and next subject', async () => {
    const quads = [
      DF.quad(DF.namedNode('http://ex.org/mygraph1'), DF.namedNode('http://ex.org/pred1'),
        DF.namedNode('http://ex.org/obj1')),
      DF.quad(DF.blankNode('b2'), DF.namedNode('http://ex.org/pred2'),
        DF.namedNode('http://ex.org/obj2'), DF.namedNode('http://ex.org/mygraph1')),
      DF.quad(DF.namedNode('http://ex.org/mygraph1'), DF.namedNode('http://ex.org/pred2'),
        DF.namedNode('http://ex.org/obj1')),
    ];
    return expect(await serialize(quads)).toEqual(
      [
        {
          "@id": "http://ex.org/mygraph1",
          "http://ex.org/pred1": [
            { "@id": "http://ex.org/obj1" },
          ],
          "@graph": [
            {
              "@id": "_:b2",
              "http://ex.org/pred2": [
                { "@id": "http://ex.org/obj2" },
              ],
            },
          ],
          "http://ex.org/pred2": [
            { "@id": "http://ex.org/obj1" },
          ],
        },
      ]);
  });

  it('should serialize a triple with subject equal to last named graph followed by another quad', async () => {
    const quads = [
      DF.quad(DF.blankNode('b2'), DF.namedNode('http://ex.org/pred2'),
        DF.namedNode('http://ex.org/obj2'), DF.namedNode('http://ex.org/mygraph1')),
      DF.quad(DF.namedNode('http://ex.org/mygraph1'), DF.namedNode('http://ex.org/pred1'),
        DF.namedNode('http://ex.org/obj1')),
      DF.quad(DF.blankNode('b2'), DF.namedNode('http://ex.org/pred2'),
        DF.namedNode('http://ex.org/obj2'), DF.namedNode('http://ex.org/mygraph2')),
    ];
    return expect(await serialize(quads)).toEqual(
      [
        {
          "@id": "http://ex.org/mygraph1",
          "@graph": [
            {
              "@id": "_:b2",
              "http://ex.org/pred2": [
                { "@id": "http://ex.org/obj2" },
              ],
            },
          ],
          "http://ex.org/pred1": [
            { "@id": "http://ex.org/obj1" },
          ],
        },
        {
          "@id": "http://ex.org/mygraph2",
          "@graph": [
            {
              "@id": "_:b2",
              "http://ex.org/pred2": [
                { "@id": "http://ex.org/obj2" },
              ],
            },
          ],
        },
      ]);
  });

  it('should serialize a quad with graph equal to last subject, followed by another quad', async () => {
    const quads = [
      DF.quad(DF.namedNode('http://ex.org/mygraph1'), DF.namedNode('http://ex.org/pred1'),
        DF.namedNode('http://ex.org/obj1')),
      DF.quad(DF.blankNode('b2'), DF.namedNode('http://ex.org/pred2'),
        DF.namedNode('http://ex.org/obj2'), DF.namedNode('http://ex.org/mygraph1')),
      DF.quad(DF.blankNode('b2'), DF.namedNode('http://ex.org/pred2'),
        DF.namedNode('http://ex.org/obj2'), DF.namedNode('http://ex.org/mygraph2')),
    ];
    return expect(await serialize(quads)).toEqual(
      [
        {
          "@id": "http://ex.org/mygraph1",
          "http://ex.org/pred1": [
            { "@id": "http://ex.org/obj1" },
          ],
          "@graph": [
            {
              "@id": "_:b2",
              "http://ex.org/pred2": [
                { "@id": "http://ex.org/obj2" },
              ],
            },
          ],
        },
        {
          "@id": "http://ex.org/mygraph2",
          "@graph": [
            {
              "@id": "_:b2",
              "http://ex.org/pred2": [
                { "@id": "http://ex.org/obj2" },
              ],
            },
          ],
        },
      ]);
  });

  it('should serialize a complex mix of triples and quads', async () => {
    const quads = [
      DF.quad(DF.namedNode('http://data.wikipedia.org/snaks/Assertions'),
        DF.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
        DF.namedNode('http://data.wikipedia.org/vocab#SnakSet')),
      DF.quad(DF.namedNode('http://data.wikipedia.org/snaks/Assertions'),
        DF.namedNode('http://data.wikipedia.org/vocab#assertedBy'),
        DF.literal('http://gregkellogg.net/foaf#me')),
      DF.quad(DF.namedNode('http://data.wikipedia.org/snaks/BerlinFact'),
        DF.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
        DF.namedNode('http://data.wikipedia.org/vocab#Snak'),
        DF.namedNode('http://data.wikipedia.org/snaks/Assertions')),
      DF.quad(DF.namedNode('http://data.wikipedia.org/snaks/BerlinFact'),
        DF.namedNode('http://data.wikipedia.org/vocab#assertedBy'),
        DF.literal('http://www.statistik-berlin-brandenburg.de/'),
        DF.namedNode('http://data.wikipedia.org/snaks/Assertions')),
      DF.quad(DF.namedNode('http://en.wikipedia.org/wiki/Berlin'),
        DF.namedNode('http://data.wikipedia.org/vocab#population'),
        DF.literal('3499879', DF.namedNode('http://www.w3.org/2001/XMLSchema#integer')),
        DF.namedNode('http://data.wikipedia.org/snaks/BerlinFact')),
    ];
    return expect(await serialize(quads)).toEqual(
      [
        {
          "@id": "http://data.wikipedia.org/snaks/Assertions",
          "@type": ["http://data.wikipedia.org/vocab#SnakSet"],
          "http://data.wikipedia.org/vocab#assertedBy": [
            { "@value": "http://gregkellogg.net/foaf#me" },
          ],
          "@graph": [
            {
              "@id": "http://data.wikipedia.org/snaks/BerlinFact",
              "@type": ["http://data.wikipedia.org/vocab#Snak"],
              "http://data.wikipedia.org/vocab#assertedBy": [
                { "@value": "http://www.statistik-berlin-brandenburg.de/" },
              ],
            },
          ],
        },
        {
          "@id": "http://data.wikipedia.org/snaks/BerlinFact",
          "@graph": [
            {
              "@id": "http://en.wikipedia.org/wiki/Berlin",
              "http://data.wikipedia.org/vocab#population": [
                {
                  "@value": "3499879",
                  "@type": "http://www.w3.org/2001/XMLSchema#integer",
                },
              ],
            },
          ],
        },
      ]);
  });

  it('should serialize a triple with a base IRI', async () => {
    const quads = [
      DF.quad(DF.namedNode('http://ex.org/myid1'), DF.namedNode('http://type.org/pred1'),
        DF.namedNode('http://ex.org/obj1')),
    ];
    return expect(await serialize(quads, new JsonLdSerializer({ baseIRI: 'http://ex.org/' }))).toEqual(
      {
        "@context": {
          "@base": "http://ex.org/",
        },
        "@graph": [
          {
            "@id": "myid1",
            "http://type.org/pred1": [
              { "@id": "obj1" },
            ],
          },
        ],
      });
  });

  it('should serialize a triple with a base IRI but not emit context it if excludeContext is true', async () => {
    const quads = [
      DF.quad(DF.namedNode('http://ex.org/myid1'), DF.namedNode('http://type.org/pred1'),
        DF.namedNode('http://ex.org/obj1')),
    ];
    return expect(await serialize(quads, new JsonLdSerializer({ baseIRI: 'http://ex.org/', excludeContext: true })))
      .toEqual([
        {
          "@id": "myid1",
          "http://type.org/pred1": [
            { "@id": "obj1" },
          ],
        },
      ]);
  });

  it('should serialize a triple with a context', async () => {
    const quads = [
      DF.quad(DF.namedNode('http://ex.org/myid1'), DF.namedNode('http://type.org/pred1'),
        DF.namedNode('http://ex.org/obj1')),
    ];
    const context = {
      "@base": "http://ex.org/",
      "@vocab": "http://type.org/",
    };
    return expect(await serialize(quads, new JsonLdSerializer({ context }))).toEqual(
      {
        "@context": {
          "@base": "http://ex.org/",
          "@vocab": "http://type.org/",
        },
        "@graph": [
          {
            "@id": "myid1",
            "pred1": [
              { "@id": "obj1" },
            ],
          },
        ],
      });
  });

  it('should serialize a triple with a context but not emit it if excludeContext is true', async () => {
    const quads = [
      DF.quad(DF.namedNode('http://ex.org/myid1'), DF.namedNode('http://type.org/pred1'),
        DF.namedNode('http://ex.org/obj1')),
    ];
    const context = {
      "@base": "http://ex.org/",
      "@vocab": "http://type.org/",
    };
    return expect(await serialize(quads, new JsonLdSerializer({ context, excludeContext: true }))).toEqual(
      [
        {
          "@id": "myid1",
          "pred1": [
            { "@id": "obj1" },
          ],
        },
      ]);
  });

  it('should serialize triples with a complex context with prefixes', async () => {
    const quads = [
      DF.quad(DF.namedNode('http://ex.org/myid1'), DF.namedNode('http://type.org/pred1'),
        DF.namedNode('http://ex.org/obj1')),
    ];
    const context = {
      ex: "http://ex.org/",
      type: "http://type.org/",
    };
    return expect(await serialize(quads, new JsonLdSerializer({ context }))).toEqual(
      {
        "@context": {
          ex: "http://ex.org/",
          type: "http://type.org/",
        },
        "@graph": [
          {
            "@id": "ex:myid1",
            "type:pred1": [
              { "@id": "ex:obj1" },
            ],
          },
        ],
      });
  });

  it('should serialize triples with a complex context with alias terms', async () => {
    const quads = [
      DF.quad(DF.namedNode('http://ex.org/myid1'), DF.namedNode('http://type.org/pred1'),
        DF.namedNode('http://ex.org/obj1')),
    ];
    const context = {
      id: "http://ex.org/myid1",
      p: "http://type.org/pred1",
      o: "http://ex.org/obj1",
    };
    return expect(await serialize(quads, new JsonLdSerializer({ context }))).toEqual(
      {
        "@context": {
          id: "http://ex.org/myid1",
          p: "http://type.org/pred1",
          o: "http://ex.org/obj1",
        },
        "@graph": [
          {
            "@id": "http://ex.org/myid1",
            "p": [
              { "@id": "http://ex.org/obj1" },
            ],
          },
        ],
      });
  });

  it('should serialize with a quad as subject', async () => {
    const quads = [
      DF.quad(
        DF.quad(
          DF.namedNode('http://ex.org/bob'),
          DF.namedNode('http://ex.org/knows'),
          DF.namedNode('http://ex.org/alice'),
        ),
        DF.namedNode('http://ex.org/certainty'),
        DF.literal('0.8'),
      ),
    ];
    return expect(await serialize(quads)).toEqual(
      [
        {
          "@id": {
            "@id": "http://ex.org/bob",
            "http://ex.org/knows": [
              { "@id": "http://ex.org/alice" },
            ],
          },
          "http://ex.org/certainty": [
            { "@value": "0.8" },
          ],
        },
      ]);
  });

  it('should serialize two quads with the same quad as subject', async () => {
    const quads = [
      DF.quad(
        DF.quad(
          DF.namedNode('http://ex.org/bob'),
          DF.namedNode('http://ex.org/knows'),
          DF.namedNode('http://ex.org/alice'),
        ),
        DF.namedNode('http://ex.org/certainty'),
        DF.literal('0.8'),
      ),
      DF.quad(
        DF.quad(
          DF.namedNode('http://ex.org/bob'),
          DF.namedNode('http://ex.org/knows'),
          DF.namedNode('http://ex.org/alice'),
        ),
        DF.namedNode('http://ex.org/createdBy'),
        DF.namedNode('http://ex.org/alice'),
      ),
    ];
    return expect(await serialize(quads)).toEqual(
      [
        {
          "@id": {
            "@id": "http://ex.org/bob",
            "http://ex.org/knows": [
              { "@id": "http://ex.org/alice" },
            ],
          },
          "http://ex.org/certainty": [
            { "@value": "0.8" },
          ],
          "http://ex.org/createdBy": [
            { "@id": "http://ex.org/alice" },
          ],
        },
      ]);
  });

  it('should serialize two quads with the different quad as subject', async () => {
    const quads = [
      DF.quad(
        DF.quad(
          DF.namedNode('http://ex.org/bob'),
          DF.namedNode('http://ex.org/knows'),
          DF.namedNode('http://ex.org/alice'),
        ),
        DF.namedNode('http://ex.org/certainty'),
        DF.literal('0.8'),
      ),
      DF.quad(
        DF.quad(
          DF.namedNode('http://ex.org/bob'),
          DF.namedNode('http://ex.org/knows'),
          DF.namedNode('http://ex.org/carol'),
        ),
        DF.namedNode('http://ex.org/createdBy'),
        DF.namedNode('http://ex.org/alice'),
      ),
    ];
    return expect(await serialize(quads)).toEqual(
      [
        {
          "@id": {
            "@id": "http://ex.org/bob",
            "http://ex.org/knows": [
              { "@id": "http://ex.org/alice" },
            ],
          },
          "http://ex.org/certainty": [
            { "@value": "0.8" },
          ],
        },
        {
          "@id": {
            "@id": "http://ex.org/bob",
            "http://ex.org/knows": [
              { "@id": "http://ex.org/carol" },
            ],
          },
          "http://ex.org/createdBy": [
            { "@id": "http://ex.org/alice" },
          ],
        },
      ]);
  });

  it('should serialize with a quad as object', async () => {
    const quads = [
      DF.quad(
        DF.namedNode('http://ex.org/bob'),
        DF.namedNode('http://ex.org/claims'),
        DF.quad(
          DF.namedNode('http://ex.org/bob'),
          DF.namedNode('http://ex.org/knows'),
          DF.namedNode('http://ex.org/alice'),
        ),
      ),
    ];
    return expect(await serialize(quads)).toEqual(
      [
        {
          "@id": "http://ex.org/bob",
          "http://ex.org/claims": [
            {
              "@id": {
                "@id": "http://ex.org/bob",
                "http://ex.org/knows": [
                  { "@id": "http://ex.org/alice" },
                ],
              },
            },
          ],
        },
      ]);
  });

  it('should serialize two unrelated nested quads', async () => {
    const quads = [
      DF.quad(
        DF.namedNode('http://ex.org/bob'),
        DF.namedNode('http://ex.org/claims'),
        DF.quad(
          DF.namedNode('http://ex.org/bob'),
          DF.namedNode('http://ex.org/knows'),
          DF.namedNode('http://ex.org/alice'),
        ),
      ),
      DF.quad(
        DF.namedNode('http://ex.org/carol'),
        DF.namedNode('http://ex.org/claims'),
        DF.quad(
          DF.namedNode('http://ex.org/bob'),
          DF.namedNode('http://ex.org/knows'),
          DF.namedNode('http://ex.org/alice'),
        ),
      ),
    ];
    return expect(await serialize(quads)).toEqual(
      [
        {
          "@id": "http://ex.org/bob",
          "http://ex.org/claims": [
            {
              "@id": {
                "@id": "http://ex.org/bob",
                "http://ex.org/knows": [
                  { "@id": "http://ex.org/alice" },
                ],
              },
            },
          ],
        },
        {
          "@id": "http://ex.org/carol",
          "http://ex.org/claims": [
            {
              "@id": {
                "@id": "http://ex.org/bob",
                "http://ex.org/knows": [
                  { "@id": "http://ex.org/alice" },
                ],
              },
            },
          ],
        },
      ]);
  });

  it('should serialize two related nested quads', async () => {
    const quads = [
      DF.quad(
        DF.namedNode('http://ex.org/bob'),
        DF.namedNode('http://ex.org/claims'),
        DF.quad(
          DF.namedNode('http://ex.org/bob'),
          DF.namedNode('http://ex.org/knows'),
          DF.namedNode('http://ex.org/alice'),
        ),
      ),
      DF.quad(
        DF.namedNode('http://ex.org/bob'),
        DF.namedNode('http://ex.org/claims'),
        DF.quad(
          DF.namedNode('http://ex.org/alice'),
          DF.namedNode('http://ex.org/knows'),
          DF.namedNode('http://ex.org/bob'),
        ),
      ),
    ];
    return expect(await serialize(quads)).toEqual(
      [
        {
          "@id": "http://ex.org/bob",
          "http://ex.org/claims": [
            {
              "@id": {
                "@id": "http://ex.org/bob",
                "http://ex.org/knows": [
                  { "@id": "http://ex.org/alice" },
                ],
              },
            },
            {
              "@id": {
                "@id": "http://ex.org/alice",
                "http://ex.org/knows": [
                  { "@id": "http://ex.org/bob" },
                ],
              },
            },
          ],
        },
      ]);
  });

  it('should fail to serialize nested quads in the non-default graph', async () => {
    const quads = [
      DF.quad(
        DF.namedNode('http://ex.org/bob'),
        DF.namedNode('http://ex.org/claims'),
        DF.quad(
          DF.namedNode('http://ex.org/bob'),
          DF.namedNode('http://ex.org/knows'),
          DF.namedNode('http://ex.org/alice'),
          DF.namedNode('http://ex.org/illegal-graph'),
        ),
      ),
    ];
    return expect(serialize(quads)).rejects.toThrow(new Error('Found a nested quad with the non-default graph: http://ex.org/illegal-graph'));
  });

  async function serialize(quadsArray, customSerializer?) {
    return JSON.parse(await stringifyStream(streamifyArray(quadsArray).pipe(customSerializer || serializer)));
  }

  describe('#import', () => {
    it('should parse a stream', async () => {
      const quads = [
        DF.quad(DF.namedNode('http://ex.org/myid1'), DF.namedNode('http://ex.org/pred1'), DF.literal('abc')),
        DF.quad(DF.namedNode('http://ex.org/myid1'), DF.namedNode('http://ex.org/pred1'), DF.literal('def')),
      ];
      return expect(JSON.parse(await stringifyStream(serializer.import(streamifyArray(quads))))).toEqual([
        {
          "@id": "http://ex.org/myid1",
          "http://ex.org/pred1": [
            { "@value": "abc" },
            { "@value": "def" },
          ],
        },
      ]);
    });

    it('should parse another stream', async () => {
      const quads = [
        DF.quad(DF.namedNode('http://ex.org/myid2'), DF.namedNode('http://ex.org/pred1'), DF.literal('abc')),
        DF.quad(DF.namedNode('http://ex.org/myid2'), DF.namedNode('http://ex.org/pred1'), DF.literal('def')),
      ];
      return expect(JSON.parse(await stringifyStream(serializer.import(streamifyArray(quads))))).toEqual([
        {
          "@id": "http://ex.org/myid2",
          "http://ex.org/pred1": [
            { "@value": "abc" },
            { "@value": "def" },
          ],
        },
      ]);
    });

    it('should forward error events', async () => {
      const stream = new PassThrough();
      stream._read = () => stream.emit('error', new Error('my error'));
      return expect(stringifyStream(serializer.import(stream))).rejects.toThrow(new Error('my error'));
    });
  });

  describe('list', () => {
    it('should emit an empty list in a triple', async () => {
      serializer.write(DF.quad(DF.namedNode('http://ex.org/subj1'), DF.namedNode('http://ex.org/pred1'),
        await serializer.list([])));
      serializer.end();
      return expect(JSON.parse(await stringifyStream(serializer))).toEqual([
        {
          "@id": "http://ex.org/subj1",
          "http://ex.org/pred1": [
            {
              "@list": [],
            },
          ],
        },
      ]);
    });

    it('should emit a list with named nodes in a triple', async () => {
      serializer.write(DF.quad(DF.namedNode('http://ex.org/subj1'), DF.namedNode('http://ex.org/pred1'),
        await serializer.list([
          DF.namedNode('a'),
          DF.namedNode('b'),
        ])));
      serializer.end();
      return expect(JSON.parse(await stringifyStream(serializer))).toEqual([
        {
          "@id": "http://ex.org/subj1",
          "http://ex.org/pred1": [
            {
              "@list": [
                { '@id': 'a' },
                { '@id': 'b' },
              ],
            },
          ],
        },
      ]);
    });

    it('should emit a list with literals in a triple', async () => {
      serializer.write(DF.quad(DF.namedNode('http://ex.org/subj1'), DF.namedNode('http://ex.org/pred1'),
        await serializer.list([
          DF.literal('a'),
          DF.literal('b'),
        ])));
      serializer.end();
      return expect(JSON.parse(await stringifyStream(serializer))).toEqual([
        {
          "@id": "http://ex.org/subj1",
          "http://ex.org/pred1": [
            {
              "@list": [
                { '@value': 'a' },
                { '@value': 'b' },
              ],
            },
          ],
        },
      ]);
    });
  });

});

describe('JsonLdSerializer with pretty-printing', () => {

  let serializer: JsonLdSerializer;

  beforeEach(() => {
    serializer = new JsonLdSerializer({ space: '  ' });
  });

  it('should serialize an empty stream', async () => {
    const quads = [];
    return expect(await serialize(quads)).toEqual(`[
]
`);
  });

  it('should serialize a single triple', async () => {
    const quads = [
      DF.quad(DF.namedNode('http://ex.org/myid'), DF.namedNode('http://ex.org/pred1'), DF.namedNode('http://ex.org/obj1')),
    ];
    return expect(await serialize(quads)).toEqual(`[
  {
    "@id": "http://ex.org/myid",
    "http://ex.org/pred1": [
      {
        "@id": "http://ex.org/obj1"
      }
    ]
  }
]
`);
  });

  it('should serialize two triples with different subjects and predicates', async () => {
    const quads = [
      DF.quad(DF.namedNode('http://ex.org/myid1'), DF.namedNode('http://ex.org/pred1'), DF.namedNode('http://ex.org/obj1')),
      DF.quad(DF.namedNode('http://ex.org/myid2'), DF.namedNode('http://ex.org/pred2'), DF.namedNode('http://ex.org/obj1')),
    ];
    return expect(await serialize(quads)).toEqual(`[
  {
    "@id": "http://ex.org/myid1",
    "http://ex.org/pred1": [
      {
        "@id": "http://ex.org/obj1"
      }
    ]
  },
  {
    "@id": "http://ex.org/myid2",
    "http://ex.org/pred2": [
      {
        "@id": "http://ex.org/obj1"
      }
    ]
  }
]
`);
  });

  it('should serialize two triples with different subjects but equal predicates', async () => {
    const quads = [
      DF.quad(DF.namedNode('http://ex.org/myid1'), DF.namedNode('http://ex.org/pred1'), DF.namedNode('http://ex.org/obj1')),
      DF.quad(DF.namedNode('http://ex.org/myid2'), DF.namedNode('http://ex.org/pred1'), DF.namedNode('http://ex.org/obj1')),
    ];
    return expect(await serialize(quads)).toEqual(`[
  {
    "@id": "http://ex.org/myid1",
    "http://ex.org/pred1": [
      {
        "@id": "http://ex.org/obj1"
      }
    ]
  },
  {
    "@id": "http://ex.org/myid2",
    "http://ex.org/pred1": [
      {
        "@id": "http://ex.org/obj1"
      }
    ]
  }
]
`);
  });

  it('should serialize two triples with equal subjects but different predicates', async () => {
    const quads = [
      DF.quad(DF.namedNode('http://ex.org/myid1'), DF.namedNode('http://ex.org/pred1'), DF.namedNode('http://ex.org/obj1')),
      DF.quad(DF.namedNode('http://ex.org/myid1'), DF.namedNode('http://ex.org/pred2'), DF.namedNode('http://ex.org/obj1')),
    ];
    return expect(await serialize(quads)).toEqual(`[
  {
    "@id": "http://ex.org/myid1",
    "http://ex.org/pred1": [
      {
        "@id": "http://ex.org/obj1"
      }
    ],
    "http://ex.org/pred2": [
      {
        "@id": "http://ex.org/obj1"
      }
    ]
  }
]
`);
  });

  it('should serialize two triples with equal subjects and predicates', async () => {
    const quads = [
      DF.quad(DF.namedNode('http://ex.org/myid1'), DF.namedNode('http://ex.org/pred1'), DF.namedNode('http://ex.org/obj1')),
      DF.quad(DF.namedNode('http://ex.org/myid1'), DF.namedNode('http://ex.org/pred1'), DF.namedNode('http://ex.org/obj2')),
    ];
    return expect(await serialize(quads)).toEqual(`[
  {
    "@id": "http://ex.org/myid1",
    "http://ex.org/pred1": [
      {
        "@id": "http://ex.org/obj1"
      }
      ,
      {
        "@id": "http://ex.org/obj2"
      }
    ]
  }
]
`);
  });

  it('should serialize two quads', async () => {
    const quads = [
      DF.quad(DF.blankNode('b1'), DF.namedNode('http://ex.org/pred1'),
        DF.namedNode('http://ex.org/obj1'), DF.namedNode('http://ex.org/mygraph1')),
      DF.quad(DF.blankNode('b2'), DF.namedNode('http://ex.org/pred2'),
        DF.namedNode('http://ex.org/obj2'), DF.namedNode('http://ex.org/mygraph2')),
    ];
    return expect(await serialize(quads)).toEqual(`[
  {
    "@id": "http://ex.org/mygraph1",
    "@graph": [
      {
        "@id": "_:b1",
        "http://ex.org/pred1": [
          {
            "@id": "http://ex.org/obj1"
          }
        ]
      }
    ]
  },
  {
    "@id": "http://ex.org/mygraph2",
    "@graph": [
      {
        "@id": "_:b2",
        "http://ex.org/pred2": [
          {
            "@id": "http://ex.org/obj2"
          }
        ]
      }
    ]
  }
]
`);
  });

  it('should serialize a quad with graph equal to last subject', async () => {
    const quads = [
      DF.quad(DF.namedNode('http://ex.org/mygraph1'), DF.namedNode('http://ex.org/pred1'),
        DF.namedNode('http://ex.org/obj1')),
      DF.quad(DF.blankNode('b2'), DF.namedNode('http://ex.org/pred2'),
        DF.namedNode('http://ex.org/obj2'), DF.namedNode('http://ex.org/mygraph1')),
    ];
    return expect(await serialize(quads)).toEqual(`[
  {
    "@id": "http://ex.org/mygraph1",
    "http://ex.org/pred1": [
      {
        "@id": "http://ex.org/obj1"
      }
    ],
    "@graph": [
      {
        "@id": "_:b2",
        "http://ex.org/pred2": [
          {
            "@id": "http://ex.org/obj2"
          }
        ]
      }
    ]
  }
]
`);
  });

  it('should serialize a quad with graph equal to last and next subject', async () => {
    const quads = [
      DF.quad(DF.namedNode('http://ex.org/mygraph1'), DF.namedNode('http://ex.org/pred1'),
        DF.namedNode('http://ex.org/obj1')),
      DF.quad(DF.blankNode('b2'), DF.namedNode('http://ex.org/pred2'),
        DF.namedNode('http://ex.org/obj2'), DF.namedNode('http://ex.org/mygraph1')),
      DF.quad(DF.namedNode('http://ex.org/mygraph1'), DF.namedNode('http://ex.org/pred2'),
        DF.namedNode('http://ex.org/obj1')),
    ];
    return expect(await serialize(quads)).toEqual(`[
  {
    "@id": "http://ex.org/mygraph1",
    "http://ex.org/pred1": [
      {
        "@id": "http://ex.org/obj1"
      }
    ],
    "@graph": [
      {
        "@id": "_:b2",
        "http://ex.org/pred2": [
          {
            "@id": "http://ex.org/obj2"
          }
        ]
      }
    ],
    "http://ex.org/pred2": [
      {
        "@id": "http://ex.org/obj1"
      }
    ]
  }
]
`);
  });

  it('should serialize a triple with subject equal to last named graph followed by another quad', async () => {
    const quads = [
      DF.quad(DF.blankNode('b2'), DF.namedNode('http://ex.org/pred2'),
        DF.namedNode('http://ex.org/obj2'), DF.namedNode('http://ex.org/mygraph1')),
      DF.quad(DF.namedNode('http://ex.org/mygraph1'), DF.namedNode('http://ex.org/pred1'),
        DF.namedNode('http://ex.org/obj1')),
      DF.quad(DF.blankNode('b2'), DF.namedNode('http://ex.org/pred2'),
        DF.namedNode('http://ex.org/obj2'), DF.namedNode('http://ex.org/mygraph2')),
    ];
    return expect(await serialize(quads)).toEqual(`[
  {
    "@id": "http://ex.org/mygraph1",
    "@graph": [
      {
        "@id": "_:b2",
        "http://ex.org/pred2": [
          {
            "@id": "http://ex.org/obj2"
          }
        ]
      }
    ],
    "http://ex.org/pred1": [
      {
        "@id": "http://ex.org/obj1"
      }
    ]
  },
  {
    "@id": "http://ex.org/mygraph2",
    "@graph": [
      {
        "@id": "_:b2",
        "http://ex.org/pred2": [
          {
            "@id": "http://ex.org/obj2"
          }
        ]
      }
    ]
  }
]
`);
  });

  it('should serialize a triple with a context', async () => {
    const quads = [
      DF.quad(DF.namedNode('http://ex.org/myid1'), DF.namedNode('http://type.org/pred1'),
        DF.namedNode('http://ex.org/obj1')),
    ];
    const context = {
      "@base": "http://ex.org/",
      "@vocab": "http://type.org/",
    };
    return expect(await serialize(quads, new JsonLdSerializer({ context, space: '  ' }))).toEqual(`{
  "@context":
  {
    "@base": "http://ex.org/",
    "@vocab": "http://type.org/"
  },
  "@graph": [
    {
      "@id": "myid1",
      "pred1": [
        {
          "@id": "obj1"
        }
      ]
    }
  ]
}
`);
  });

  it('should serialize a triple with a context compactly', async () => {
    const quads = [
      DF.quad(DF.namedNode('http://ex.org/myid1'), DF.namedNode('http://type.org/pred1'),
        DF.namedNode('http://ex.org/obj1')),
    ];
    const context = {
      "@base": "http://ex.org/",
      "@vocab": "http://type.org/",
    };
    // tslint:disable-next-line:max-line-length
    return expect(await serialize(quads, new JsonLdSerializer({ context }))).toEqual(`{"@context":{"@base":"http://ex.org/","@vocab":"http://type.org/"},"@graph":[{"@id":"myid1","pred1":[{"@id":"obj1"}]}]}`);
  });

  it('should serialize a quad as subject', async () => {
    const quads = [
      DF.quad(
        DF.quad(
          DF.namedNode('http://ex.org/bob'),
          DF.namedNode('http://ex.org/knows'),
          DF.namedNode('http://ex.org/alice'),
        ),
        DF.namedNode('http://ex.org/certainty'),
        DF.literal('0.8'),
      ),
    ];
    return expect(await serialize(quads)).toEqual(`[
  {
    "@id": {
      "@id": "http://ex.org/bob",
      "http://ex.org/knows": [
        {
          "@id": "http://ex.org/alice"
        }
      ]
    },
    "http://ex.org/certainty": [
      {
        "@value": "0.8"
      }
    ]
  }
]
`);
  });

  it('should serialize with a quad as object', async () => {
    const quads = [
      DF.quad(
        DF.namedNode('http://ex.org/bob'),
        DF.namedNode('http://ex.org/claims'),
        DF.quad(
          DF.namedNode('http://ex.org/bob'),
          DF.namedNode('http://ex.org/knows'),
          DF.namedNode('http://ex.org/alice'),
        ),
      ),
    ];
    return expect(await serialize(quads)).toEqual(`[
  {
    "@id": "http://ex.org/bob",
    "http://ex.org/claims": [
      {
        "@id": {
          "@id": "http://ex.org/bob",
          "http://ex.org/knows": [
            {
              "@id": "http://ex.org/alice"
            }
          ]
        }
      }
    ]
  }
]
`);
  });

  async function serialize(quadsArray, customSerializer?) {
    return await stringifyStream(streamifyArray(quadsArray).pipe(customSerializer || serializer));
  }

});
