/* This file was automatically generated. Do not edit by hand. */

export default ({ factory }: { factory: import('@rdfjs/types').DataFactory }): import('@rdfjs/types').Quad[] => {
  const f = factory
  const ns1 = 'http://example.org/'
  const ns2 = 'http://www.w3.org/2001/XMLSchema#'
  const blankNodes: import('@rdfjs/types').BlankNode[] = []
  for (let i = 0; i < 2; i++) {
    blankNodes.push(f.blankNode())
  }

  return [
    f.quad(
      blankNodes[0],
      f.namedNode(`${ns1}predicate1`),
      f.literal('object')
    ),
    f.quad(
      blankNodes[0],
      f.namedNode(`${ns1}predicate2`),
      f.literal('text', 'en')
    ),
    f.quad(
      blankNodes[1],
      f.namedNode(`${ns1}predicate3`),
      f.literal('123.0', f.namedNode(`${ns2}double`)),
      f.namedNode(`${ns1}graph`)
    )
  ]
}
