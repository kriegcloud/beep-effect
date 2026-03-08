import type { BaseQuad } from '@rdfjs/types';
import type { DataFactory } from 'rdf-data-factory';
import { describe, it } from 'vitest';
import type { TestFunction } from 'vitest';

interface Parser {
  parse: (query: string, context?: { prefixes?: Record<string, string>; baseIRI?: string }) => unknown;
}

export function importSparql11NoteTests(parser: Parser, DF: DataFactory<BaseQuad>): void {
  function testErroneousQuery(query: string, _errorMsg: string): TestFunction<object> {
    return ({ expect }) => {
      let error: any;
      try {
        parser.parse(query);
      } catch (e) {
        error = e;
      }
      expect(error).not.toBeUndefined();
      expect(error).toBeInstanceOf(Error);
      // Expect(error.message).toContain(errorMsg);
    };
  }

  it('should throw an error on an invalid query', testErroneousQuery('invalid', 'Parse error on line 1'));

  it.skip('should throw an error on a projection of ungrouped variable', testErroneousQuery(
    'PREFIX : <http://www.example.org/> SELECT ?o WHERE { ?s ?p ?o } GROUP BY ?s',
    'Projection of ungrouped variable (?o)',
  ));

  it('should throw an error on a values class with LESS variables than value', testErroneousQuery(
    'SELECT * WHERE { } VALUES ( ?S ) { ( true  false ) }',
    'Number of dataBlockValues does not match number of variables. Too much values.',
  ));

  it('should throw an error on a values class with MORE variables than value', testErroneousQuery(
    'SELECT * WHERE { } VALUES ( ?S ?O ) { ( true ) }',
    'Number of dataBlockValues does not match number of variables. Too few values.',
  ));

  it('should NOT throw on a values class with correct amount of values', ({ expect }) => {
    const query = 'SELECT * WHERE { } VALUES ( ?S ) { ( true ) }';
    expect(parser.parse(query)).toMatchObject({});
  });

  it.skip('should throw an error on an invalid selectscope', testErroneousQuery(
    'SELECT (1 AS ?X ) { SELECT (2 AS ?X ) {} }',
    'Target id of \'AS\' (?X) already used in subquery',
  ));

  it.skip('should throw an error on bind to variable in scope', testErroneousQuery(
    'SELECT * { ?s ?p ?o BIND(?o AS ?o) }',
    'Target id of \'AS\' (?X) already used in subquery',
  ));

  it('should parse when not ending in newline', ({ expect }) => {
    const query = 'select?s{?s?p?o}#wow, what a query';
    expect(parser.parse(query)).toMatchObject({});
  });

  it('should preserve BGP and filter pattern order', ({ expect }) => {
    const query = 'SELECT * { ?s ?p "1" . FILTER(true) . ?s ?p "2"  }';
    expect(parser.parse(query)).toMatchObject({
      where: {
        patterns: [
          { subType: 'bgp' },
          { subType: 'filter' },
          { subType: 'bgp' },
        ],
      },
    });
  });

  it('should throw an error on an aggregate function within an aggregate function', testErroneousQuery(
    'SELECT (SUM(COUNT(?lprice)) AS ?totalPrice) { }',
    'An aggregate function is not allowed within an aggregate function',
  ));

  describe('with pre-defined prefixes', () => {
    const prefixes = { a: 'ex:abc#', b: 'ex:def#' };

    it.skip('should use those prefixes', ({ expect }) => {
      const query = 'SELECT * { a:a b:b "" }';
      expect(parser.parse(query, { prefixes })).toMatchObject({
        where: [
          {
            triples: [
              {
                subject: DF.namedNode('ex:abc#a'),
                predicate: DF.namedNode('ex:def#b'),
                object: DF.literal(''),
              },
            ],
          },
        ],
      });
    });

    it.skip('should allow temporarily overriding prefixes', ({ expect }) => {
      const query = 'PREFIX a: <ex:xyz#> SELECT * { a:a b:b "" }';
      expect(parser.parse(query, { prefixes })).toMatchObject({
        where: [{
          triples: [{
            subject: DF.namedNode('ex:xyz#a'),
            predicate: DF.namedNode('ex:def#b'),
            object: DF.literal(''),
          }],
        },
        ],
      });

      const query2 = 'SELECT * { a:a b:b "" }';
      expect(parser.parse(query2, { prefixes })).toMatchObject({
        where: [{
          triples: [{
            subject: DF.namedNode('ex:abc#a'),
            predicate: DF.namedNode('ex:def#b'),
            object: DF.literal(''),
          }],
        },
        ],
      });
    });

    it('should not change the original prefixes', ({ expect }) => {
      expect(prefixes).toEqual({ a: 'ex:abc#', b: 'ex:def#' });
    });
  });

  describe('with pre-defined base IRI', () => {
    const context = { baseIRI: 'http://ex.org/' };

    it.skip('contains the base', ({ expect }) => {
      const query = 'SELECT * { ?s ?p ?o }';
      expect(parser.parse(query, context)).toMatchObject({
        base: 'http://ex.org/',
      });
    });

    it.skip('using prefixed as relative iri', ({ expect }) => {
      const context = { baseIRI: 'http://ex.org/apl' };
      const query = `
CONSTRUCT
FROM <data.ttl>
WHERE { ?s ?p ?o }
`;
      expect(parser.parse(query, context)).toMatchObject({
        from: {
          default: [
            DF.namedNode('http://ex.org/data.ttl'),
          ],
        },
      });
    });

    it.skip('should use the base IRI', ({ expect }) => {
      const query = 'SELECT * { <> <#b> "" }';
      const result = {
        subject: DF.namedNode('http://ex.org/'),
        predicate: DF.namedNode('http://ex.org/#b'),
        object: DF.literal(''),
      };

      expect(parser.parse(query, context)).toMatchObject({
        where: [{ triples: [ result ]}],
      });
    });

    it.skip('should work after a previous query failed', ({ expect }) => {
      const badQuery = 'SELECT * { <> <#b> "" } invalid!';
      expect(() => parser.parse(badQuery, context)).toThrow(Error);

      const goodQuery = 'SELECT * { <> <#b> "" }';

      const context = { baseIRI: 'http://ex2.org/' };
      const result = {
        subject: DF.namedNode('http://ex2.org/'),
        predicate: DF.namedNode('http://ex2.org/#b'),
        object: DF.literal(''),
      };
      const data = parser.parse(goodQuery, context);
      expect(data).toMatchObject({
        where: [{ triples: [ result ]}],
      });
    });
  });

  it.skip('should throw an error on relative IRIs if no base IRI is specified', testErroneousQuery(
    'SELECT * { <a> <b> <c> }',
    'Cannot resolve relative IRI a because no base IRI was set.',
  ));

  describe('with group collapsing disabled', () => {
    it.skip('should keep explicit pattern group', ({ expect }) => {
      const query = 'SELECT * WHERE { { ?s ?p ?o } ?a ?b ?c }';
      const result = [
        {
          type: 'group',
          patterns: [
            {
              type: 'bgp',
              triples: [
                {
                  subject: DF.variable('s'),
                  predicate: DF.variable('p'),
                  object: DF.variable('o'),
                },
              ],
            },
          ],
        },
        {
          type: 'bgp',
          triples: [
            {
              subject: DF.variable('a'),
              predicate: DF.variable('b'),
              object: DF.variable('c'),
            },
          ],
        },
      ];

      expect(parser.parse(query)).toMatchObject({ where: result });
    });

    it.skip('should still collapse immediate union groups', ({ expect }) => {
      const query = 'SELECT * WHERE { { ?s ?p ?o } UNION { ?a ?b ?c } }';

      const result = [
        {
          type: 'union',
          patterns: [{
            type: 'bgp',
            triples: [{
              subject: {
                termType: 'Variable',
                value: 's',
              },
              predicate: {
                termType: 'Variable',
                value: 'p',
              },
              object: {
                termType: 'Variable',
                value: 'o',
              },
            }],
          }, {
            type: 'bgp',
            triples: [{
              subject: {
                termType: 'Variable',
                value: 'a',
              },
              predicate: {
                termType: 'Variable',
                value: 'b',
              },
              object: {
                termType: 'Variable',
                value: 'c',
              },
            }],
          }],
        },
      ];

      expect(parser.parse(query)).toMatchObject({ where: result });
    });
  });

  describe('for update queries', () => {
    it('should throw an error on blank nodes in DELETE clause', testErroneousQuery(
      'DELETE { ?a <ex:knows> [] . } WHERE { ?a <ex:knows> "Alan" . }',
      'Detected illegal blank node in BGP',
    ));

    it('should not throw on blank nodes in INSERT clause', ({ expect }) => {
      const query = 'INSERT { ?a <ex:knows> [] . } WHERE { ?a <ex:knows> "Alan" . }';
      // TODO: add proper test
      expect(parser.parse(query)).toMatchObject({});
    });

    it('should throw an error on blank nodes in compact DELETE clause', testErroneousQuery(
      'DELETE WHERE { _:a <ex:p> <ex:o> }',
      'Detected illegal blank node in BGP',
    ));

    it('should throw an error on variables in DELETE DATA clause', testErroneousQuery(
      'DELETE DATA { ?a <ex:p> <ex:o> }',
      'Detected illegal variable in BGP',
    ));

    it('should throw an error on blank nodes in DELETE DATA clause', testErroneousQuery(
      'DELETE DATA { _:a <ex:p> <ex:o> }',
      'Detected illegal blank node in BGP',
    ));

    it('should throw an error on variables in DELETE DATA clause with GRAPH', testErroneousQuery(
      'DELETE DATA { GRAPH ?a { <ex:s> <ex:p> <ex:o> } }',
      'Detected illegal variable in GRAPH',
    ));

    it('should throw an error on variables in INSERT DATA clause', testErroneousQuery(
      'INSERT DATA { ?a <ex:p> <ex:o> }',
      'Detected illegal variable in BGP',
    ));

    it('should not throw on reused blank nodes in one INSERT DATA clause', ({ expect }) => {
      const query = 'INSERT DATA { _:a <ex:p> <ex:o> . _:a <ex:p> <ex:o> . }';
      // Todo: add proper test
      expect(parser.parse(query)).toMatchObject({});
    });

    it.skip('should throw an error on reused blank nodes across INSERT DATA clauses', testErroneousQuery(
      'INSERT DATA { _:a <ex:p> <ex:o> }; INSERT DATA { _:a <ex:p> <ex:o> }',
      'Detected reuse blank node across different INSERT DATA clauses',
    ));

    it.skip('should throw an error on reused blank nodes across INSERT DATA clauses with GRAPH', testErroneousQuery(
      'INSERT DATA { _:a <ex:p> <ex:o> }; INSERT DATA { GRAPH <ex:g> { _:a <ex:p> <ex:o> } }',
      'Detected reuse blank node across different INSERT DATA clauses',
    ));

    it('should not throw on comment between INSERT and DATA', ({ expect }) => {
      const query = `INSERT
# Comment
DATA { GRAPH <ex:G> { <ex:s> <ex:p> 'o1', 'o2', 'o3' } }`;
      // TODO: add proper test
      expect(parser.parse(query)).toMatchObject({});
    });

    it('should not throw on comment after INSERT that could be confused with DATA', ({ expect }) => {
      const query = `INSERT # DATA
DATA { GRAPH <ex:G> { <ex:s> <ex:p> 'o1', 'o2', 'o3' } }`;
      // TODO: add proper test
      expect(parser.parse(query)).toMatchObject({});
    });

    it('should throw an error on commented DATA after INSERT', testErroneousQuery(
      'INSERT # DATA { GRAPH <ex:G> { <ex:s> <ex:p> \'o1\', \'o2\', \'o3\' } }',
      'Parse error',
    ));
  });

  it('should throw an error on unicode codepoint escaping in literal with partial surrogate pair', testErroneousQuery(
    'SELECT * WHERE { ?s <ex:p> \'\uD800\' }',
    'Invalid unicode codepoint of surrogate pair without corresponding codepoint',
  ));

  it(
    'should not throw an error on unicode codepoint escaping in literal with complete surrogate pair',
    ({ expect }) => {
      const query = 'SELECT * WHERE { ?s <ex:p> \'\uD800\uDFFF\' }';
      // TODO: add proper test
      expect(parser.parse(query)).toMatchObject({});
    },
  );
}
