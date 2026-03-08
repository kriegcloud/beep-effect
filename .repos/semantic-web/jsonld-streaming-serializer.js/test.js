const JsonLdSerializer = require(".").JsonLdSerializer;

const dataFactory = require('@rdfjs/data-model');
const mySerializer = new JsonLdSerializer({
  space: '  ',
  context: {
    termA: 'http://ex.org/a',
    termB: 'http://ex.org/b',
    p: 'http://ex.org/p1',
  },
});
mySerializer.pipe(process.stdout);

mySerializer.write(dataFactory.triple(
  dataFactory.namedNode('http://ex.org/s1'),
  dataFactory.namedNode('http://ex.org/p1'),
  mySerializer.list([
    dataFactory.namedNode('http://ex.org/o1'),
    dataFactory.namedNode('http://ex.org/o2'),
    dataFactory.namedNode('http://ex.org/o3'),
  ]),
));
mySerializer.end();