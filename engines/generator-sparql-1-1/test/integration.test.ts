import { traqulaIndentation } from '@traqula/core';
import { Parser } from '@traqula/parser-sparql-1-1';
import type * as T11 from '@traqula/rules-sparql-1-1';
import { AstFactory, AstTransformer } from '@traqula/rules-sparql-1-1';
import { beforeEach, describe, it } from 'vitest';
import { Generator } from '../lib/index.js';

describe('a SPARQL 1.1 generator', () => {
  const generator = new Generator();
  const F = new AstFactory();
  const parser = new Parser({ lexerConfig: { positionTracking: 'full' }, defaultContext: { astFactory: F }});
  const transformer = new AstTransformer();

  beforeEach(() => {
    F.resetBlankNodeCounter();
  });

  it ('generates simple round tripped', ({ expect }) => {
    const query = 'SELECT * WHERE { ?s ?p ?o }';
    const ast = <T11.Query> parser.parse(query);
    const result = generator.generate(ast);
    expect(result).toBe(query);
  });

  it ('self generates on no pretty', ({ expect }) => {
    const query = 'SELECT * WHERE { ?s ?p ?o . }';
    const ast = parser.parse(query);
    const result = generator.generate(F.forcedAutoGenTree(ast), { [traqulaIndentation]: -1, indentInc: 0 });
    expect(result).toBe(query);
  });

  describe('on altered nodes', () => {
    it('translates ?s -> ?subject', ({ expect }) => {
      const query = 'SELECT * WHERE { ?s ?p ?o }';
      const ast = <T11.Query> parser.parse(query);

      const altered = transformer.transformNodeSpecific<'unsafe', T11.Query>(
        ast,
        {},
        { term: { variable: {
          transform: variable => variable.value === 's' ?
            F.termVariable('subject', F.sourceLocationNodeReplaceUnsafe(variable.loc)) :
            variable,
        }}},
      );

      const result = generator.generate(altered);
      expect(result).toBe(`SELECT * WHERE { ?subject ?p ?o }`);
    });

    it('translates blanknodes -> variables', ({ expect }) => {
      const query = `

BASE <ex:>
CONSTRUCT { 
  ?s0 ?p0 _:g_0 .
_:g_0 <a0> _:g_1 .
_:g_1 <b0> <c0> .
[
  <a0> [
    <b0> <c0> ;    
  ] ;  
] ?p0 ?o0 .

}
WHERE {
  ?s1 ?p1 _:g_4 .
?s1 ?p1 <a1> .
?s1 ?q1 <b1> .
?s1 ?q1 <c1> .
_:g_5 ?p2 ?o2 .
?s3 ?p3 _:g_6 .
_:g_6 <a3> <b3> .
?s4 ?p4 _:g_7 .
_:g_7 <a4> <b4> .
_:g_7 <c4> <d4> .
_:g_7 <c4> <e4> .
?s5 ?p5 _:g_8 .
_:g_8 <a5> _:g_9 .
_:g_9 <b5> <c5> .
[
  <a6> [
    <b6> <c6> ;    
  ] ;  
] ?p6 ?o6 .
_:g_12 <a7> <b7> .
_:g_12 <c7> <d7> .
_:g_12 <c7> <e7> .

}`;
      const ast = <T11.Query> parser.parse(query);

      function extractCollection(collection: T11.TripleCollection): T11.TripleNesting[] {
        const result: T11.TripleNesting[] = [];
        for (const entry of collection.triples) {
          const subject = entry.subject;
          const pred = entry.predicate;
          if (F.isTripleCollection(entry.object)) {
            const identifier = { ...F.graphNodeIdentifier(entry.object) };
            result.push(F.triple(subject, pred, identifier, F.gen()));
            result.push(...extractCollection(entry.object));
          } else {
            result.push(F.triple(
              subject,
              pred,
              entry.object,
              F.gen(),
            ));
          }
        }
        return result;
      }

      const flattenCollections = transformer.transformNodeSpecific<'unsafe', T11.Query>(
        ast,
        {},
        { pattern: { bgp: {
          transform: (current) => {
            const bgpCopy = F.forcedAutoGenTree(current);
            const newTriples: T11.TripleNesting[] = [];
            for (const entry of bgpCopy.triples) {
              if (F.isTriple(entry)) {
                const subject = entry.subject;
                const pred = entry.predicate;
                if (F.isTripleCollection(entry.object)) {
                  const object = entry.object;
                  const identifier = { ...F.graphNodeIdentifier(object) };
                  newTriples.push(F.triple(subject, pred, identifier));
                  newTriples.push(...extractCollection(object));
                } else {
                  newTriples.push(F.triple(
                    subject,
                    pred,
                    entry.object,
                    F.gen(),
                  ));
                }
              } else {
                const genTriples = extractCollection(entry);
                newTriples.push(...genTriples);
              }
            }
            return F.patternBgp(newTriples, F.sourceLocationNodeReplaceUnsafe(current.loc));
          },
        }}},
      );

      const result = generator.generate(flattenCollections);
      expect(result).toBe(`BASE <ex:>
CONSTRUCT { 
  ?s0 ?p0 _:g_0 .
_:g_0 <a0> _:g_1 .
_:g_1 <b0> <c0> .
[
  <a0> [
    <b0> <c0> ;
  ] ;
] ?p0 ?o0 .


}
WHERE {
  ?s1 ?p1 _:g_4 .
?s1 ?p1 <a1> .
?s1 ?q1 <b1> .
?s1 ?q1 <c1> .
_:g_5 ?p2 ?o2 .
?s3 ?p3 _:g_6 .
_:g_6 <a3> <b3> .
?s4 ?p4 _:g_7 .
_:g_7 <a4> <b4> .
_:g_7 <c4> <d4> .
_:g_7 <c4> <e4> .
?s5 ?p5 _:g_8 .
_:g_8 <a5> _:g_9 .
_:g_9 <b5> <c5> .
[
  <a6> [
    <b6> <c6> ;
  ] ;
] ?p6 ?o6 .
_:g_12 <a7> <b7> .
_:g_12 <c7> <d7> .
_:g_12 <c7> <e7> .


}`);
    });
  });

  it ('generates hand constructed query', ({ expect }) => {
    const query = `
SELECT * WHERE {
  ?s ?p ?o .
}`;
    const ast = F.querySelect({
      variables: [ F.wildcard(F.gen()) ],
      datasets: F.datasetClauses([], F.sourceLocation()),
      context: [],
      where: F.patternGroup([
        F.patternBgp([
          F.triple(F.termVariable('s', F.gen()), F.termVariable('p', F.gen()), F.termVariable('o', F.gen())),
        ], F.gen()),
      ], F.gen()),
      solutionModifiers: {},
    }, F.gen());
    const result = generator.generate(ast);
    expect(result.trim()).toBe(query.trim());
  });
});
