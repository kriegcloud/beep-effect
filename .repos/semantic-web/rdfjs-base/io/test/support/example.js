import toNT from '@rdfjs/to-ntriples'
import { Readable } from 'readable-stream'
import factory from './factory.js'

const example = {}

example.dataset = factory.dataset([
  factory.quad(
    factory.namedNode('http://example.org/subject'),
    factory.namedNode('http://example.org/predicate'),
    factory.literal('object1')
  ),
  factory.quad(
    factory.namedNode('http://example.org/subject'),
    factory.namedNode('http://example.org/predicate'),
    factory.literal('object2')
  )
])

example.nt = toNT(example.dataset)
example.ttl = `@prefix ex: <http://example.org/>.

ex:subject
  ex:predicate
    "object1",
    "object2".
`

example.stream = () => Readable.from(example.dataset)

export default example
