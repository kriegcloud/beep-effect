import { strictEqual } from 'assert'

function runTests ({ factory, mocha }) {
  const { describe, it } = mocha

  describe('.quad', () => {
    it('should be a static method', () => {
      strictEqual(typeof factory.quad, 'function')
    })

    it('should create an object with .subject, .predicate, .object and .graph with the given values', () => {
      const subject = factory.namedNode('http://example.org/subject')
      const predicate = factory.namedNode('http://example.org/predicate')
      const object = factory.namedNode('http://example.org/object')
      const graph = factory.namedNode('http://example.org/graph')
      const quad = factory.quad(subject, predicate, object, graph)

      strictEqual(subject.equals(quad.subject), true)
      strictEqual(predicate.equals(quad.predicate), true)
      strictEqual(object.equals(quad.object), true)
      strictEqual(graph.equals(quad.graph), true)

      strictEqual(quad.termType, 'Quad')
      strictEqual(quad.value, '')
    })

    it('should create an object .graph set to DefaultGraph if the argument isn\'t given', () => {
      const subject = factory.namedNode('http://example.org/subject')
      const predicate = factory.namedNode('http://example.org/predicate')
      const object = factory.namedNode('http://example.org/object')
      const graph = factory.defaultGraph()
      const quad = factory.quad(subject, predicate, object)

      strictEqual(quad.graph.equals(graph), true)

      strictEqual(quad.termType, 'Quad')
      strictEqual(quad.value, '')
    })

    describe('.equals', () => {
      it('should return true if the other quad contains the same subject, predicate, object and graph', () => {
        const subject = factory.namedNode('http://example.org/subject')
        const predicate = factory.namedNode('http://example.org/predicate')
        const object = factory.namedNode('http://example.org/object')
        const graph = factory.namedNode('http://example.org/graph')
        const quad1 = factory.quad(subject, predicate, object, graph)
        const quad2 = factory.quad(subject, predicate, object, graph)

        strictEqual(quad1.equals(quad2), true)
      })

      it('should return true even if the other equal quad is from a non-RDF* factory', () => {
        const subject = factory.namedNode('http://example.org/subject')
        const predicate = factory.namedNode('http://example.org/predicate')
        const object = factory.namedNode('http://example.org/object')
        const graph = factory.namedNode('http://example.org/graph')
        const quad1 = factory.quad(subject, predicate, object, graph)
        const quad2 = { subject, predicate, object, graph }

        strictEqual(quad1.equals(quad2), true)
      })

      it('should return false if the subject of the other quad is not the same', () => {
        const subject1 = factory.namedNode('http://example.org/subject')
        const subject2 = factory.namedNode('http://example.com/subject')
        const predicate = factory.namedNode('http://example.org/predicate')
        const object = factory.namedNode('http://example.org/object')
        const graph = factory.namedNode('http://example.org/graph')
        const quad1 = factory.quad(subject1, predicate, object, graph)
        const quad2 = factory.quad(subject2, predicate, object, graph)

        strictEqual(quad1.equals(quad2), false)
      })

      it('should return false even if the other non-equal quad is from a non-RDF* factory', () => {
        const subject1 = factory.namedNode('http://example.org/subject')
        const subject2 = factory.namedNode('http://example.com/subject')
        const predicate = factory.namedNode('http://example.org/predicate')
        const object = factory.namedNode('http://example.org/object')
        const graph = factory.namedNode('http://example.org/graph')
        const quad1 = factory.quad(subject1, predicate, object, graph)
        const quad2 = { subject: subject2, predicate, object, graph }

        strictEqual(quad1.equals(quad2), false)
      })

      it('should return false if the predicate of the other quad is not the same', () => {
        const subject = factory.namedNode('http://example.org/subject')
        const predicate1 = factory.namedNode('http://example.org/predicate')
        const predicate2 = factory.namedNode('http://example.com/predicate')
        const object = factory.namedNode('http://example.org/object')
        const graph = factory.namedNode('http://example.org/graph')
        const quad1 = factory.quad(subject, predicate1, object, graph)
        const quad2 = factory.quad(subject, predicate2, object, graph)

        strictEqual(quad1.equals(quad2), false)
      })

      it('should return false if the object of the other quad is not the same', () => {
        const subject = factory.namedNode('http://example.org/subject')
        const predicate = factory.namedNode('http://example.org/predicate')
        const object1 = factory.namedNode('http://example.org/object')
        const object2 = factory.namedNode('http://example.com/object')
        const graph = factory.namedNode('http://example.org/graph')
        const quad1 = factory.quad(subject, predicate, object1, graph)
        const quad2 = factory.quad(subject, predicate, object2, graph)

        strictEqual(quad1.equals(quad2), false)
      })

      it('should return false if the graph of the other quad is not the same', () => {
        const subject = factory.namedNode('http://example.org/subject')
        const predicate = factory.namedNode('http://example.org/predicate')
        const object = factory.namedNode('http://example.org/object')
        const graph1 = factory.namedNode('http://example.org/graph')
        const graph2 = factory.namedNode('http://example.com/graph')
        const quad1 = factory.quad(subject, predicate, object, graph1)
        const quad2 = factory.quad(subject, predicate, object, graph2)

        strictEqual(quad1.equals(quad2), false)
      })

      it('should return false if value is falsy', () => {
        const subject = factory.namedNode('http://example.org/subject')
        const predicate = factory.namedNode('http://example.org/predicate')
        const object = factory.namedNode('http://example.org/object')
        const graph = factory.namedNode('http://example.org/graph')
        const quad = factory.quad(subject, predicate, object, graph)

        strictEqual(quad.equals(null), false)
      })

      it('should return false if value is another term', () => {
        const subject = factory.namedNode('http://example.org/subject')
        const predicate = factory.namedNode('http://example.org/predicate')
        const object = factory.namedNode('http://example.org/object')
        const graph = factory.namedNode('http://example.org/graph')
        const quad = factory.quad(subject, predicate, object, graph)

        strictEqual(quad.equals(factory.namedNode('http://example.org/subject')), false)
        strictEqual(quad.equals(factory.literal('abc')), false)
        strictEqual(quad.equals(factory.variable('var')), false)
        strictEqual(quad.equals(factory.blankNode('bnode')), false)
        strictEqual(quad.equals(factory.defaultGraph()), false)
      })

      it('should return true for an equal nested quad', () => {
        const subject = factory.namedNode('http://example.org/predicate')
        const predicate = factory.namedNode('http://example.org/predicate')
        const object = factory.quad(
          factory.namedNode('http://example.org/subjectInner2'),
          factory.namedNode('http://example.org/predicateInner2'),
          factory.namedNode('http://example.org/objectInner2'),
          factory.namedNode('http://example.org/graphInner2')
        )
        const graph = factory.namedNode('http://example.org/graph')
        const quad1 = factory.quad(subject, predicate, object, graph)
        const quad2 = factory.quad(subject, predicate, object, graph)

        strictEqual(quad1.equals(quad2), true)
      })
    })
  })
}

export default runTests
