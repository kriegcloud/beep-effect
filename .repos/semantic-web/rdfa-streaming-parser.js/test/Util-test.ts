import {DataFactory} from "rdf-data-factory";
import "jest-rdf";
import {Util} from "../lib/Util";

const DF = new DataFactory();

describe('Util', () => {

  it('should be constructable with null dataFactory and null baseIRI', () => {
    const instance = new Util(null, null);
    expect(instance).toBeInstanceOf(Util);
    expect((<any> instance).dataFactory).toBeInstanceOf(DataFactory);
    expect((<any> instance).baseIRI).toEqualRdfTerm(DF.namedNode(''));
  });

  it('should be constructable with non-null dataFactory and non-null baseIRI', () => {
    const dataFactory: any = { defaultGraph: () => 'abc', namedNode: () => DF.namedNode('abc') };
    const instance = new Util(dataFactory, 'abc');
    expect(instance).toBeInstanceOf(Util);
    expect((<any> instance).dataFactory).toBe(dataFactory);
    expect((<any> instance).baseIRI).toEqualRdfTerm(DF.namedNode('abc'));
  });

  describe('#parseNamespace', () => {
    it('should parse a tag without prefix attribute', () => {
      const attributes = {};
      return expect(Util.parsePrefixes(attributes, {}, false)).toEqual({});
    });

    it('should parse a tag with empty prefix attribute', () => {
      const attributes = {
        prefix: '',
      };
      return expect(Util.parsePrefixes(attributes, {}, false)).toEqual({});
    });

    it('should parse a tag with one prefix', () => {
      const attributes = {
        prefix: 'dc: http://purl.org/dc/terms/',
      };
      return expect(Util.parsePrefixes(attributes, {}, false)).toEqual({
        dc: 'http://purl.org/dc/terms/',
      });
    });

    it('should parse a tag with two prefixes', () => {
      const attributes = {
        prefix: 'dc: http://purl.org/dc/terms/ abc: http://example.org',
      };
      return expect(Util.parsePrefixes(attributes, {}, false)).toEqual({
        abc: 'http://example.org',
        dc: 'http://purl.org/dc/terms/',
      });
    });

    it('should parse a tag with one prefix and silently ignore invalid prefixes (1)', () => {
      const attributes = {
        prefix: 'dc: http://purl.org/dc/terms/ abc',
      };
      return expect(Util.parsePrefixes(attributes, {}, false)).toEqual({
        dc: 'http://purl.org/dc/terms/',
      });
    });

    it('should parse a tag with one prefix and silently ignore invalid prefixes (2)', () => {
      const attributes = {
        prefix: 'dc: http://purl.org/dc/terms/ abc:',
      };
      return expect(Util.parsePrefixes(attributes, {}, false)).toEqual({
        dc: 'http://purl.org/dc/terms/',
      });
    });

    it('should parse a tag without prefix attribute that inherits parent prefixes', () => {
      const attributes = {};
      return expect(Util.parsePrefixes(attributes, {
        ex: 'http://example.org',
      }, false)).toEqual({
        ex: 'http://example.org',
      });
    });

    it('should parse a tag without prefixes that inherits parent prefixes', () => {
      const attributes = {
        prefix: '',
      };
      return expect(Util.parsePrefixes(attributes, {
        ex: 'http://example.org',
      }, false)).toEqual({
        ex: 'http://example.org',
      });
    });

    it('should parse a tag with one prefix that combines parent prefixes', () => {
      const attributes = {
        prefix: 'dc: http://purl.org/dc/terms/',
      };
      return expect(Util.parsePrefixes(attributes, {
        ex: 'http://example.org',
      }, false)).toEqual({
        dc: 'http://purl.org/dc/terms/',
        ex: 'http://example.org',
      });
    });

    it('should parse a tag with one prefix that overrides a parent prefix', () => {
      const attributes = {
        prefix: 'dc: http://purl.org/dc/terms/',
      };
      return expect(Util.parsePrefixes(attributes, {
        dc: 'http://example.org',
      }, false)).toEqual({
        dc: 'http://purl.org/dc/terms/',
      });
    });

    it('should parse a tag with one prefix with newlines', () => {
      const attributes = {
        prefix: 'dc: http://purl.org/dc/terms/\nex: \nhttp://example.org/',
      };
      return expect(Util.parsePrefixes(attributes, {}, false)).toEqual({
        dc: 'http://purl.org/dc/terms/',
        ex: 'http://example.org/',
      });
    });

    it('should not parse an xmlns attribute if xmlnsPrefixMappings is false', () => {
      const attributes = {
        'xmlns:ex': 'http://example.org/',
      };
      return expect(Util.parsePrefixes(attributes, {}, false)).toEqual({});
    });

    it('should parse an xmlns attribute if xmlnsPrefixMappings is true', () => {
      const attributes = {
        'xmlns:ex': 'http://example.org/',
      };
      return expect(Util.parsePrefixes(attributes, {}, true)).toEqual({
        ex: 'http://example.org/',
      });
    });

    it('should parse an xmlns attribute if xmlnsPrefixMappings is true and inherit from parent', () => {
      const attributes = {
        'xmlns:ex': 'http://example.org/',
      };
      return expect(Util.parsePrefixes(attributes, { abc: 'def' }, true)).toEqual({
        abc: 'def',
        ex: 'http://example.org/',
      });
    });

    it('should parse an xmlns attribute but give @prefix preference if xmlnsPrefixMappings is true', () => {
      const attributes = {
        'prefix': 'ex: http://example.org/',
        'xmlns:ex': 'http://exampleignored.org/',
      };
      return expect(Util.parsePrefixes(attributes, {}, true)).toEqual({
        ex: 'http://example.org/',
      });
    });

    it('should parse an xmlns attribute but give @prefix preference and inherit if xmlnsPrefixMappings is true', () => {
      const attributes = {
        'prefix': 'ex: http://example.org/',
        'xmlns:ex': 'http://exampleignored.org/',
      };
      return expect(Util.parsePrefixes(attributes, { abc: 'def' }, true)).toEqual({
        abc: 'def',
        ex: 'http://example.org/',
      });
    });
  });

  describe('#expandPrefixedTerm', () => {
    it('should expand a valid prefixed term', () => {
      const activeTag: any = {
        prefixesAll: {
          dc: 'http://purl.org/dc/terms/',
        },
      };
      return expect(Util.expandPrefixedTerm('dc:bla', activeTag))
        .toEqual('http://purl.org/dc/terms/bla');
    });

    it('should expand a term with empty prefix', () => {
      const activeTag: any = {
        prefixesAll: {},
      };
      return expect(Util.expandPrefixedTerm(':bla', activeTag))
        .toEqual('http://www.w3.org/1999/xhtml/vocab#bla');
    });

    it('should expand a valid term', () => {
      const activeTag: any = {
        prefixesAll: {
          term: 'http://purl.org/dc/terms/term',
        },
      };
      return expect(Util.expandPrefixedTerm('term', activeTag))
        .toEqual('http://purl.org/dc/terms/term');
    });

    it('should not expand an unknown prefix', () => {
      const activeTag: any = {
        prefixesAll: {
          dc: 'http://purl.org/dc/terms/',
        },
      };
      return expect(Util.expandPrefixedTerm('bla:bla', activeTag))
        .toEqual('bla:bla');
    });

    it('should not expand an url', () => {
      const activeTag: any = {
        prefixesAll: {
          dc: 'http://purl.org/dc/terms/',
        },
      };
      return expect(Util.expandPrefixedTerm('http://example.org/bla', activeTag))
        .toEqual('http://example.org/bla');
    });

    it('should not expand a term', () => {
      const activeTag: any = {
        prefixesAll: {
          dc: 'http://purl.org/dc/terms/',
        },
      };
      return expect(Util.expandPrefixedTerm('bla', activeTag)).toEqual('bla');
    });

    it('should not expand an empty term', () => {
      const activeTag: any = {
        prefixesAll: {
          '': 'http://purl.org/dc/terms/',
        },
      };
      return expect(Util.expandPrefixedTerm('', activeTag)).toEqual('');
    });
  });

  describe('#contentTypeToProfile', () => {
    it('should return empty string for an unknown content type', () => {
      return expect(Util.contentTypeToProfile('text/unknown'))
        .toEqual('');
    });

    it('should return html for text/html', () => {
      return expect(Util.contentTypeToProfile('text/html'))
        .toEqual('html');
    });

    it('should return xhtml for application/xhtml+xml', () => {
      return expect(Util.contentTypeToProfile('application/xhtml+xml'))
        .toEqual('xhtml');
    });

    it('should return xml for application/xml', () => {
      return expect(Util.contentTypeToProfile('application/xml'))
        .toEqual('xml');
    });

    it('should return xml for text/xml', () => {
      return expect(Util.contentTypeToProfile('text/xml'))
        .toEqual('xml');
    });

    it('should return xml for image/svg+xml', () => {
      return expect(Util.contentTypeToProfile('image/svg+xml'))
        .toEqual('xml');
    });
  });

  describe('a default instance', () => {

    let util;

    beforeEach(() => {
      util = new Util(null, 'http://example.org/');
    });

    describe('#createIri', () => {
      it('should create relative IRIs when CURIEs are not allowed', async () => {
        const activeTag: any = {};
        return expect(util.createIri('http://ex.org/abc', activeTag, false, false, true))
          .toEqualRdfTerm(DF.namedNode('http://ex.org/abc'));
      });

      it('should create absolute IRIs when CURIEs are not allowed', async () => {
        const activeTag: any = {};
        return expect(util.createIri('abc', activeTag, false, false, true))
          .toEqualRdfTerm(DF.namedNode('http://example.org/abc'));
      });

      it('should not create invalid IRIs when CURIEs are not allowed in vocab mode', async () => {
        const activeTag: any = {};
        return expect(util.createIri('abc', activeTag, true, false, true))
          .toBeFalsy();
      });

      it('should create blank nodes if allowBlankNode is true', async () => {
        const activeTag: any = {};
        return expect(util.createIri('_:b1', activeTag, false, true, true))
          .toEqualRdfTerm(DF.blankNode('b1'));
      });

      it('should create blank nodes unless allowBlankNode is false', async () => {
        const activeTag: any = {};
        return expect(util.createIri('_:b1', activeTag, false, true, false))
          .toBeFalsy();
      });

      it('should handle prefixed IRIs', async () => {
        const activeTag: any = {
          prefixesAll: {
            ex: 'http://example.org/',
          },
        };
        return expect(util.createIri('ex:def', activeTag, false, true, true))
          .toEqualRdfTerm(DF.namedNode('http://example.org/def'));
      });

      it('should handle prefixed IRIs with unknown prefixes', async () => {
        const activeTag: any = {
          prefixesAll: {},
        };
        return expect(util.createIri('ex:def', activeTag, false, true, true))
          .toEqualRdfTerm(DF.namedNode('ex:def'));
      });

      it('should handle relative IRIs', async () => {
        const activeTag: any = {
          prefixesAll: {},
        };
        return expect(util.createIri('def', activeTag, false, true, true))
          .toEqualRdfTerm(DF.namedNode('http://example.org/def'));
      });

      it('should not handle relative IRIs in vocab mode without active vocab', async () => {
        const activeTag: any = {
          prefixesAll: {},
        };
        return expect(util.createIri('def', activeTag, true, true, true))
          .toBeFalsy();
      });

      it('should handle relative IRIs in vocab mode with active vocab', async () => {
        const activeTag: any = {
          prefixesAll: {},
          vocab: 'http://vocab.org/',
        };
        return expect(util.createIri('def', activeTag, true, true, true))
          .toEqualRdfTerm(DF.namedNode('http://vocab.org/def'));
      });

      it('should handle prefixed relative IRIs', async () => {
        const activeTag: any = {
          prefixesAll: {
            abc: 'abc/',
          },
        };
        return expect(util.createIri('abc:def', activeTag, false, true, true))
          .toEqualRdfTerm(DF.namedNode('http://example.org/abc/def'));
      });

      it('should handle explicit blank nodes', async () => {
        const activeTag: any = {};
        return expect(util.createIri('[_:b]', activeTag, false, true, true))
          .toEqual(DF.blankNode('b'));
      });

      it('should handle blank nodes with no label', async () => {
        const activeTag: any = {};
        return expect(util.createIri('_:', activeTag, false, true, true))
          .toEqual(DF.blankNode('b_identity'));
      });

      it('should handle explicit blank nodes with no label', async () => {
        const activeTag: any = {};
        return expect(util.createIri('[_:]', activeTag, false, true, true))
          .toEqual(DF.blankNode('b_identity'));
      });

      it('should handle explicit IRIs', async () => {
        const activeTag: any = {
          prefixesAll: {},
        };
        return expect(util.createIri('[http://example.org]', activeTag, false, true, true))
          .toEqual(DF.namedNode('http://example.org'));
      });

      it('should return null for invalid explicit IRIs', async () => {
        const activeTag: any = {
          prefixesAll: {},
        };
        return expect(util.createIri('[invalid]', activeTag, false, true, true))
          .toEqual(null);
      });

      it('should do term expansion', async () => {
        const activeTag: any = {
          prefixesAll: {
            license: 'http://www.w3.org/1999/xhtml/vocab#license',
          },
        };
        return expect(util.createIri('license', activeTag, true, true, true))
          .toEqual(DF.namedNode('http://www.w3.org/1999/xhtml/vocab#license'));
      });

      it('should do case-insensitive term expansion', async () => {
        const activeTag: any = {
          prefixesAll: {
            license: 'http://www.w3.org/1999/xhtml/vocab#license',
          },
        };
        return expect(util.createIri('LiCeNSe', activeTag, true, true, true))
          .toEqual(DF.namedNode('http://www.w3.org/1999/xhtml/vocab#license'));
      });

      it('should make term expansion give priority to vocab', async () => {
        const activeTag: any = {
          prefixesAll: {
            license: 'http://www.w3.org/1999/xhtml/vocab#license',
          },
          vocab: 'http://vocab.org/',
        };
        return expect(util.createIri('license', activeTag, true, true, true))
          .toEqual(DF.namedNode('http://vocab.org/license'));
      });

      it('should resolve relative prefixes against baseIRI in base-mode', async () => {
        const activeTag: any = {
          prefixesAll: {
            pre: 'relative/prefix#',
          },
        };
        return expect(util.createIri('pre:suffix', activeTag, false, true, true))
          .toEqual(DF.namedNode('http://example.org/relative/prefix#suffix'));
      });

      it('should resolve relative prefixes against baseIRI in vocab-mode', async () => {
        const activeTag: any = {
          prefixesAll: {
            pre: 'relative/prefix#',
          },
        };
        return expect(util.createIri('pre:suffix', activeTag, true, true, true))
          .toEqual(DF.namedNode('http://example.org/relative/prefix#suffix'));
      });

      it('should resolve empty terms in base-mode to the baseIRI', async () => {
        const activeTag: any = {
          prefixesAll: {},
          vocab: 'http://vocab.org/',
        };
        return expect(util.createIri('', activeTag, false, true, true))
          .toEqual(DF.namedNode('http://example.org/'));
      });

      it('should resolve null terms in base-mode to the baseIRI', async () => {
        const activeTag: any = {
          prefixesAll: {},
          vocab: 'http://vocab.org/',
        };
        return expect(util.createIri(null, activeTag, false, true, true))
          .toEqual(DF.namedNode('http://example.org/'));
      });

      it('should resolve empty terms in vocab-mode to the baseIRI', async () => {
        const activeTag: any = {
          prefixesAll: {},
          vocab: 'http://vocab.org/',
        };
        return expect(util.createIri('', activeTag, true, true, true))
          .toEqual(DF.namedNode('http://vocab.org/'));
      });

      it('should resolve null terms in vocab-mode to the baseIRI', async () => {
        const activeTag: any = {
          prefixesAll: {},
          vocab: 'http://vocab.org/',
        };
        return expect(util.createIri(null, activeTag, true, true, true))
          .toEqual(DF.namedNode('http://vocab.org/'));
      });
    });

    describe('#createLiteral', () => {
      it('should create string literals', async () => {
        const activeTag: any = {};
        return expect(util.createLiteral('abc', activeTag))
          .toEqualRdfTerm(DF.literal('abc'));
      });

      it('should create datatyped literals', async () => {
        const activeTag: any = {
          datatype: DF.namedNode('http://example.org/datatype'),
        };
        return expect(util.createLiteral('abc', activeTag))
          .toEqualRdfTerm(DF.literal('abc', DF.namedNode('http://example.org/datatype')));
      });

      it('should create language literals', async () => {
        const activeTag: any = {
          language: 'en-us',
        };
        return expect(util.createLiteral('abc', activeTag))
          .toEqualRdfTerm(DF.literal('abc', 'en-us'));
      });

      it('should create case-insensitive language literals', async () => {
        const activeTag: any = {
          language: 'EN-US',
        };
        return expect(util.createLiteral('abc', activeTag))
            .toEqualRdfTerm(DF.literal('abc', 'en-us'));
      });

      it('should give preference to datatype literals over language literals', async () => {
        const activeTag: any = {
          datatype: DF.namedNode('http://example.org/datatype'),
          language: 'en-us',
        };
        return expect(util.createLiteral('abc', activeTag))
          .toEqualRdfTerm(DF.literal('abc', DF.namedNode('http://example.org/datatype')));
      });

      it('should give interpret datetimes without Z', async () => {
        const activeTag: any = {
          interpretObjectAsTime: true,
        };
        return expect(util.createLiteral('2012-03-18T00:00:00', activeTag))
          .toEqualRdfTerm(DF.literal('2012-03-18T00:00:00',
            DF.namedNode('http://www.w3.org/2001/XMLSchema#dateTime')));
      });

      it('should give interpret datetimes with Z', async () => {
        const activeTag: any = {
          interpretObjectAsTime: true,
        };
        return expect(util.createLiteral('2012-03-18T00:00:00Z', activeTag))
          .toEqualRdfTerm(DF.literal('2012-03-18T00:00:00Z',
            DF.namedNode('http://www.w3.org/2001/XMLSchema#dateTime')));
      });

      it('should give interpret datetimes with negative offset', async () => {
        const activeTag: any = {
          interpretObjectAsTime: true,
        };
        return expect(util.createLiteral('2012-03-18T00:00:00-10:00', activeTag))
          .toEqualRdfTerm(DF.literal('2012-03-18T00:00:00-10:00',
            DF.namedNode('http://www.w3.org/2001/XMLSchema#dateTime')));
      });

      it('should give interpret datetimes with positive offset', async () => {
        const activeTag: any = {
          interpretObjectAsTime: true,
        };
        return expect(util.createLiteral('2012-03-18T00:00:00+10:00', activeTag))
          .toEqualRdfTerm(DF.literal('2012-03-18T00:00:00+10:00',
            DF.namedNode('http://www.w3.org/2001/XMLSchema#dateTime')));
      });

      it('should give interpret times without Z', async () => {
        const activeTag: any = {
          interpretObjectAsTime: true,
        };
        return expect(util.createLiteral('00:00:00', activeTag))
          .toEqualRdfTerm(DF.literal('00:00:00',
            DF.namedNode('http://www.w3.org/2001/XMLSchema#time')));
      });

      it('should give interpret times with positive offset', async () => {
        const activeTag: any = {
          interpretObjectAsTime: true,
        };
        return expect(util.createLiteral('00:00:00+01:10', activeTag))
          .toEqualRdfTerm(DF.literal('00:00:00+01:10',
            DF.namedNode('http://www.w3.org/2001/XMLSchema#time')));
      });

      it('should give interpret times with negative offset', async () => {
        const activeTag: any = {
          interpretObjectAsTime: true,
        };
        return expect(util.createLiteral('00:00:00-01:10', activeTag))
          .toEqualRdfTerm(DF.literal('00:00:00-01:10',
            DF.namedNode('http://www.w3.org/2001/XMLSchema#time')));
      });

      it('should give interpret times with Z', async () => {
        const activeTag: any = {
          interpretObjectAsTime: true,
        };
        return expect(util.createLiteral('00:00:00Z', activeTag))
          .toEqualRdfTerm(DF.literal('00:00:00Z',
            DF.namedNode('http://www.w3.org/2001/XMLSchema#time')));
      });

      it('should give interpret dates', async () => {
        const activeTag: any = {
          interpretObjectAsTime: true,
        };
        return expect(util.createLiteral('2012-03-18', activeTag))
          .toEqualRdfTerm(DF.literal('2012-03-18',
            DF.namedNode('http://www.w3.org/2001/XMLSchema#date')));
      });

      it('should give interpret dates with Z', async () => {
        const activeTag: any = {
          interpretObjectAsTime: true,
        };
        return expect(util.createLiteral('2012-03-18Z', activeTag))
          .toEqualRdfTerm(DF.literal('2012-03-18Z',
            DF.namedNode('http://www.w3.org/2001/XMLSchema#date')));
      });

      it('should give interpret years', async () => {
        const activeTag: any = {
          interpretObjectAsTime: true,
        };
        return expect(util.createLiteral('2012', activeTag))
          .toEqualRdfTerm(DF.literal('2012',
            DF.namedNode('http://www.w3.org/2001/XMLSchema#gYear')));
      });

      it('should give interpret years', async () => {
        const activeTag: any = {
          interpretObjectAsTime: true,
        };
        return expect(util.createLiteral('2012-03', activeTag))
          .toEqualRdfTerm(DF.literal('2012-03',
            DF.namedNode('http://www.w3.org/2001/XMLSchema#gYearMonth')));
      });

      it('should give not interpret invalid dates (1)', async () => {
        const activeTag: any = {
          interpretObjectAsTime: true,
        };
        return expect(util.createLiteral(' 2012-03-12', activeTag))
          .toEqualRdfTerm(DF.literal(' 2012-03-12'));
      });

      it('should give not interpret invalid dates (2)', async () => {
        const activeTag: any = {
          interpretObjectAsTime: true,
        };
        return expect(util.createLiteral('2012-03-12 ', activeTag))
          .toEqualRdfTerm(DF.literal('2012-03-12 '));
      });
    });

    describe('#createVocabIris', () => {
      it('should handle a single IRI', async () => {
        const activeTag: any = {
          prefixesAll: {
            ex: 'http://example.org/',
          },
        };
        return expect(util.createVocabIris('ex:abc', activeTag, true, true))
          .toEqualRdfTermArray([
            DF.namedNode('http://example.org/abc'),
          ]);
      });

      it('should handle a two IRIs with whitespace', async () => {
        const activeTag: any = {
          prefixesAll: {
            ex: 'http://example.org/',
          },
        };
        return expect(util.createVocabIris('ex:abc ex:def', activeTag, true, true))
          .toEqualRdfTermArray([
            DF.namedNode('http://example.org/abc'),
            DF.namedNode('http://example.org/def'),
          ]);
      });

      it('should handle a two IRIs with tab', async () => {
        const activeTag: any = {
          prefixesAll: {
            ex: 'http://example.org/',
          },
        };
        return expect(util.createVocabIris('ex:abc\tex:def', activeTag, true, true))
          .toEqualRdfTermArray([
            DF.namedNode('http://example.org/abc'),
            DF.namedNode('http://example.org/def'),
          ]);
      });

      it('should handle a two IRIs with whitespace and tab', async () => {
        const activeTag: any = {
          prefixesAll: {
            ex: 'http://example.org/',
          },
        };
        return expect(util.createVocabIris('ex:abc \tex:def', activeTag, true, true))
          .toEqualRdfTermArray([
            DF.namedNode('http://example.org/abc'),
            DF.namedNode('http://example.org/def'),
          ]);
      });

      it('should handle a two IRIs with whitespaces and tabs', async () => {
        const activeTag: any = {
          prefixesAll: {
            ex: 'http://example.org/',
          },
        };
        return expect(util.createVocabIris('ex:abc\t    \t\t\t   ex:def', activeTag, true, true))
          .toEqualRdfTermArray([
            DF.namedNode('http://example.org/abc'),
            DF.namedNode('http://example.org/def'),
          ]);
      });

      it('should handle a two IRIs with whitespaces in prefix and suffix', async () => {
        const activeTag: any = {
          prefixesAll: {
            ex: 'http://example.org/',
          },
        };
        return expect(util.createVocabIris('  \t\t  ex:abc ex:def  \t   \t', activeTag, true, true))
          .toEqualRdfTermArray([
            DF.namedNode('http://example.org/abc'),
            DF.namedNode('http://example.org/def'),
          ]);
      });

      it('should handle a two IRIs with newline', async () => {
        const activeTag: any = {
          prefixesAll: {
            ex: 'http://example.org/',
          },
        };
        return expect(util.createVocabIris('ex:abc\nex:def', activeTag, true, true))
          .toEqualRdfTermArray([
            DF.namedNode('http://example.org/abc'),
            DF.namedNode('http://example.org/def'),
          ]);
      });

      it('should create an empty list for an empty string', async () => {
        util.vocab = 'http://vocab.org/';
        const activeTag: any = {
          prefixesAll: {
            ex: 'http://example.org/',
          },
        };
        return expect(util.createVocabIris('', activeTag, true, true))
          .toEqualRdfTermArray([]);
      });

      it('should handle terms when allowTerms is true', async () => {
        const activeTag: any = {
          prefixesAll: {
            termA: 'http://example.org/A',
            termB: 'http://example.org/B',
          },
          vocab: 'http://vocab.org/',
        };
        return expect(util.createVocabIris('termA termB', activeTag, true, true))
          .toEqualRdfTermArray([
            DF.namedNode('http://vocab.org/termA'),
            DF.namedNode('http://vocab.org/termB'),
          ]);
      });

      it('should ignore terms when allowTerms is false', async () => {
        const activeTag: any = {
          prefixesAll: {
            termA: 'http://example.org/A',
            termB: 'http://example.org/B',
          },
          vocab: 'http://vocab.org/',
        };
        return expect(util.createVocabIris('termA termB', activeTag, false, true))
          .toEqualRdfTermArray([]);
      });
    });

    describe('#createBlankNode', () => {
      it('should create a blank node', async () => {
        return expect(util.createBlankNode().termType).toEqual('BlankNode');
      });

      it('should create a blank node when a blank node factory is set', async () => {
        util.blankNodeFactory = () => 'bla';
        return expect(util.createBlankNode()).toEqual('bla');
      });
    });

    describe('#getResourceOrBaseIri', () => {
      it('should return the baseIRI for true', async () => {
        const activeTag: any = {
          localBaseIRI: DF.namedNode('http://base.org/'),
        };
        return expect(util.getResourceOrBaseIri(true, activeTag))
          .toEqualRdfTerm(DF.namedNode('http://base.org/'));
      });

      it('should return the term otherwise', async () => {
        const activeTag: any = {
          localBaseIRI: DF.namedNode('http://base.org/'),
        };
        return expect(util.getResourceOrBaseIri(DF.namedNode('http://term.org/'), activeTag))
          .toEqualRdfTerm(DF.namedNode('http://term.org/'));
      });
    });

    describe('#getBaseIRI', () => {
      it('should return the baseIRI without hash', async () => {
        return expect(util.getBaseIRI('http://base.org/'))
          .toEqualRdfTerm(DF.namedNode('http://base.org/'));
      });

      it('should return the baseIRI with hash', async () => {
        return expect(util.getBaseIRI('http://base.org/#hash'))
          .toEqualRdfTerm(DF.namedNode('http://base.org/'));
      });

      it('should return a relative baseIRI', async () => {
        util.baseIRI = DF.namedNode('http://example.org/');
        return expect(util.getBaseIRI('abc'))
          .toEqualRdfTerm(DF.namedNode('http://example.org/abc'));
      });
    });
  });

});
