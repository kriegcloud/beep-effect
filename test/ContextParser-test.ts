import {
  ContextParser,
  ERROR_CODES,
  ErrorCoded,
  FetchDocumentLoader,
  IDocumentLoader,
  JsonLdContextNormalized,
} from "../index";

describe('ContextParser', () => {
  describe('normalizeContextIri', () => {
    it('should redirect schema.org contexts to https by default', () => {
      expect(new ContextParser().normalizeContextIri('http://schema.org'))
        .toEqual('https://schema.org/');
      expect(new ContextParser().normalizeContextIri('http://schema.org/'))
        .toEqual('https://schema.org/');
    });

    it('should redirect schema.org contexts to https if redirectSchemaOrgHttps is true', () => {
      expect(new ContextParser({ redirectSchemaOrgHttps: true }).normalizeContextIri('http://schema.org'))
        .toEqual('https://schema.org/');
      expect(new ContextParser({ redirectSchemaOrgHttps: true }).normalizeContextIri('http://schema.org/'))
        .toEqual('https://schema.org/');
    });

    it('should not redirect schema.org contexts to https if redirectSchemaOrgHttps is false', () => {
      expect(new ContextParser({ redirectSchemaOrgHttps: false }).normalizeContextIri('http://schema.org'))
        .toEqual('http://schema.org');
      expect(new ContextParser({ redirectSchemaOrgHttps: false }).normalizeContextIri('http://schema.org/'))
        .toEqual('http://schema.org/');
    });

    it('should not change other URLS', () => {
      expect(new ContextParser().normalizeContextIri('http://example.org/'))
        .toEqual('http://example.org/');
    });
  });

  describe('validateLanguage', () => {
    describe('with strictRange', () => {
      it('should pass on valid languages', () => {
        expect(ContextParser.validateLanguage('en-us', true, ERROR_CODES.INVALID_LANGUAGE_MAPPING)).toBeTruthy();
        expect(ContextParser.validateLanguage('EN-us', true, ERROR_CODES.INVALID_LANGUAGE_MAPPING)).toBeTruthy();
        expect(ContextParser.validateLanguage('nl-be', true, ERROR_CODES.INVALID_LANGUAGE_MAPPING)).toBeTruthy();
      });

      it('should error on invalid language datatypes', () => {
        expect(() => ContextParser.validateLanguage(3, true, ERROR_CODES.INVALID_LANGUAGE_MAPPING)).toThrow();
        expect(() => ContextParser.validateLanguage({}, true, ERROR_CODES.INVALID_LANGUAGE_MAPPING)).toThrow();
      });

      it('should error on invalid language strings', () => {
        expect(() => ContextParser.validateLanguage('!', true, ERROR_CODES.INVALID_LANGUAGE_MAPPING)).toThrow();
        expect(() => ContextParser.validateLanguage('', true, ERROR_CODES.INVALID_LANGUAGE_MAPPING)).toThrow();
        expect(() => ContextParser.validateLanguage('en_us', true, ERROR_CODES.INVALID_LANGUAGE_MAPPING)).toThrow();
      });
    });

    describe('without strictRange', () => {
      it('should pass on valid languages', () => {
        expect(ContextParser.validateLanguage('en-us', false, ERROR_CODES.INVALID_LANGUAGE_MAPPING)).toBeTruthy();
        expect(ContextParser.validateLanguage('EN-us', false, ERROR_CODES.INVALID_LANGUAGE_MAPPING)).toBeTruthy();
        expect(ContextParser.validateLanguage('nl-be', false, ERROR_CODES.INVALID_LANGUAGE_MAPPING)).toBeTruthy();
      });

      it('should error on invalid language datatypes', () => {
        expect(() => ContextParser.validateLanguage(3, false, ERROR_CODES.INVALID_LANGUAGE_MAPPING)).toThrow();
        expect(() => ContextParser.validateLanguage({}, false, ERROR_CODES.INVALID_LANGUAGE_MAPPING)).toThrow();
      });

      it('should return false on invalid language strings', () => {
        expect(ContextParser.validateLanguage('!', false, ERROR_CODES.INVALID_LANGUAGE_MAPPING)).toBeFalsy();
        expect(ContextParser.validateLanguage('', false, ERROR_CODES.INVALID_LANGUAGE_MAPPING)).toBeFalsy();
        expect(ContextParser.validateLanguage('en_us', false, ERROR_CODES.INVALID_LANGUAGE_MAPPING)).toBeFalsy();
      });
    });
  });

  describe('validateDirection', () => {
    describe('with strictRange', () => {
      it('should pass on valid directions', () => {
        expect(ContextParser.validateDirection('rtl', true)).toBeTruthy();
        expect(ContextParser.validateDirection('ltr', true)).toBeTruthy();
      });

      it('should error on invalid direction datatypes', () => {
        expect(() => ContextParser.validateDirection(3, true)).toThrow();
        expect(() => ContextParser.validateDirection({}, true)).toThrow();
      });

      it('should error on invalid direction strings', () => {
        expect(() => ContextParser.validateDirection('!', true)).toThrow();
        expect(() => ContextParser.validateDirection('', true)).toThrow();
        expect(() => ContextParser.validateDirection('en_us', true)).toThrow();
      });
    });

    describe('without strictRange', () => {
      it('should pass on valid directions', () => {
        expect(ContextParser.validateDirection('rtl', false)).toBeTruthy();
        expect(ContextParser.validateDirection('ltr', false)).toBeTruthy();
      });

      it('should error on invalid direction datatypes', () => {
        expect(() => ContextParser.validateDirection(3, false)).toThrow();
        expect(() => ContextParser.validateDirection({}, false)).toThrow();
      });

      it('should return false on invalid direction strings', () => {
        expect(ContextParser.validateDirection('!', false)).toBeFalsy();
        expect(ContextParser.validateDirection('', false)).toBeFalsy();
        expect(ContextParser.validateDirection('en_us', false)).toBeFalsy();
      });
    });
  });

  describe('when instantiated without options', () => {
    let parser: ContextParser;

    beforeEach(() => {
      parser = new ContextParser();
    });

    it('should have a default document loader', async () => {
      expect((<any>parser).documentLoader).toBeInstanceOf(FetchDocumentLoader);
    });
  });

  describe('when instantiated with empty options', () => {
    let parser: ContextParser;

    beforeEach(() => {
      parser = new ContextParser({});
    });

    it('should have a default document loader', async () => {
      // @ts-expect-error
      expect(parser.documentLoader).toBeInstanceOf(FetchDocumentLoader);
    });
  });

  describe('when instantiated with skipValidation = true', () => {
    let parser: any;

    beforeEach(() => {
      parser = new ContextParser({ skipValidation: true });
    });

    it('should parse with an invalid context entry', () => {
      return expect(parser.parse(<any> { '@base': true })).resolves
        .toEqual(new JsonLdContextNormalized(<any> { '@base': true }));
    });
  });

  describe('when instantiated with options and a document loader', () => {
    let documentLoader: IDocumentLoader;
    let parser: ContextParser;

    beforeEach(() => {
      documentLoader = new FetchDocumentLoader();
      parser = new ContextParser({ documentLoader });
    });

    it('should have the given document loader', async () => {
      expect((<any> parser).documentLoader).toBe(documentLoader);
    });

    describe('expandPrefixedTerms with expandContentTypeToBase true', () => {
      it('should not modify an empty context', async () => {
        const context = new JsonLdContextNormalized({});
        parser.expandPrefixedTerms(context, true);
        expect(context.getContextRaw()).toEqual({});
      });

      it('should not modify a context without prefixes', async () => {
        const context = new JsonLdContextNormalized({
          abc: 'def',
        });
        parser.expandPrefixedTerms(context, true);
        expect(context.getContextRaw()).toEqual({
          abc: 'def',
        });
      });

      it('should expand a context with string prefixes', async () => {
        const context = new JsonLdContextNormalized({
          Example: 'ex:Example',
          ex: 'http://example.org/',
        });
        parser.expandPrefixedTerms(context, true);
        expect(context.getContextRaw()).toEqual({
          Example: 'http://example.org/Example',
          ex: 'http://example.org/',
        });
      });

      it('should expand a context with nested string prefixes', async () => {
        const context = new JsonLdContextNormalized({
          Example: 'exabc:Example',
          ex: 'http://example.org/',
          exabc: 'ex:abc/',
        });
        parser.expandPrefixedTerms(context, true);
        expect(context.getContextRaw()).toEqual({
          Example: 'http://example.org/abc/Example',
          ex: 'http://example.org/',
          exabc: 'http://example.org/abc/',
        });
      });

      it('should expand a context with object @id prefixes', async () => {
        const context = new JsonLdContextNormalized({
          Example: { '@id': 'ex:Example' },
          ex: 'http://example.org/',
        });
        parser.expandPrefixedTerms(context, true);
        expect(context.getContextRaw()).toEqual({
          Example: { '@id': 'http://example.org/Example' },
          ex: 'http://example.org/',
        });
      });

      it('should expand a context with nested object @id prefixes', async () => {
        const context = new JsonLdContextNormalized({
          Example: { '@id': 'exabc:Example' },
          ex: 'http://example.org/',
          exabc: 'ex:abc/',
        });
        parser.expandPrefixedTerms(context, true);
        expect(context.getContextRaw()).toEqual({
          Example: { '@id': 'http://example.org/abc/Example' },
          ex: 'http://example.org/',
          exabc: 'http://example.org/abc/',
        });
      });

      it('should expand a context with object @type prefixes', async () => {
        const context = new JsonLdContextNormalized({
          Example: { '@type': 'ex:Example' },
          ex: 'http://example.org/',
        });
        parser.expandPrefixedTerms(context, true);
        expect(context.getContextRaw()).toEqual({
          Example: { '@type': 'http://example.org/Example' },
          ex: 'http://example.org/',
        });
      });

      it('should expand a context with nested object @type prefixes', async () => {
        const context = new JsonLdContextNormalized({
          Example: { '@type': 'exabc:Example' },
          ex: 'http://example.org/',
          exabc: 'ex:abc/',
        });
        parser.expandPrefixedTerms(context, true);
        expect(context.getContextRaw()).toEqual({
          Example: { '@type': 'http://example.org/abc/Example' },
          ex: 'http://example.org/',
          exabc: 'http://example.org/abc/',
        });
      });

      it('should expand a context with object prefixes with @id and @type', async () => {
        const context = new JsonLdContextNormalized({
          Example: { '@id': 'ex:Example', '@type': 'ex:ExampleType' },
          ex: 'http://example.org/',
        });
        parser.expandPrefixedTerms(context, true);
        expect(context.getContextRaw()).toEqual({
          Example: { '@id': 'http://example.org/Example', '@type': 'http://example.org/ExampleType' },
          ex: 'http://example.org/',
        });
      });

      it('should not expand object prefixes that are not @id or @type', async () => {
        const context = new JsonLdContextNormalized({
          Example: { '@id': 'ex:Example', '@bla': 'ex:Example' },
          ex: 'http://example.org/',
        });
        parser.expandPrefixedTerms(context, true);
        expect(context.getContextRaw()).toEqual({
          Example: { '@id': 'http://example.org/Example', '@bla': 'ex:Example' },
          ex: 'http://example.org/',
        });
      });

      it('should not expand object prefixes without @id and @type', async () => {
        const context = new JsonLdContextNormalized({
          Example: { '@bla': 'ex:Example' },
          ex: 'http://example.org/',
        });
        parser.expandPrefixedTerms(context, true);
        expect(context.getContextRaw()).toEqual({
          Example: { '@bla': 'ex:Example' },
          ex: 'http://example.org/',
        });
      });

      it('should expand a context with object prefixes without @id and with @type', async () => {
        const context = new JsonLdContextNormalized({
          ex: 'http://ex.org/',
          p: { '@id': 'http://ex.org/pred1', '@type': 'ex:mytype' },
        });
        parser.expandPrefixedTerms(context, true);
        expect(context.getContextRaw()).toEqual({
          ex: 'http://ex.org/',
          p: { '@id': 'http://ex.org/pred1', '@type': 'http://ex.org/mytype' },
        });
      });

      it('should expand a context with object prefixes with @id and without @type', async () => {
        const context = new JsonLdContextNormalized({
          ex: 'http://ex.org/',
          p: { '@id': 'ex:pred1', '@type': 'http://ex.org/mytype' },
        });
        parser.expandPrefixedTerms(context, true);
        expect(context.getContextRaw()).toEqual({
          ex: 'http://ex.org/',
          p: { '@id': 'http://ex.org/pred1', '@type': 'http://ex.org/mytype' },
        });
      });

      it('should not expand @language', async () => {
        const context = new JsonLdContextNormalized({
          '@base': 'http://base.org/',
          '@language': 'en',
          '@vocab': 'http://vocab.org/',
          'p': { '@id': 'pred1', '@language': 'nl' },
        });
        parser.expandPrefixedTerms(context, true);
        expect(context.getContextRaw()).toEqual({
          '@base': 'http://base.org/',
          '@language': 'en',
          '@vocab': 'http://vocab.org/',
          'p': { '@id': 'http://vocab.org/pred1', '@language': 'nl' },
        });
      });

      it('should not expand @direction', async () => {
        const context = new JsonLdContextNormalized({
          '@base': 'http://base.org/',
          '@direction': 'ltr',
          '@vocab': 'http://vocab.org/',
          'p': { '@id': 'pred1', '@direction': 'rtl' },
        });
        parser.expandPrefixedTerms(context, true);
        expect(context.getContextRaw()).toEqual({
          '@base': 'http://base.org/',
          '@direction': 'ltr',
          '@vocab': 'http://vocab.org/',
          'p': { '@id': 'http://vocab.org/pred1', '@direction': 'rtl' },
        });
      });

      it('should expand terms based on the vocab IRI', async () => {
        const context = new JsonLdContextNormalized({
          '@base': 'http://base.org/',
          '@vocab': 'http://vocab.org/',
          'p': 'p',
        });
        parser.expandPrefixedTerms(context, true);
        expect(context.getContextRaw()).toEqual({
          '@base': 'http://base.org/',
          '@vocab': 'http://vocab.org/',
          'p': 'http://vocab.org/p',
        });
      });

      it('should expand nested terms based on the vocab IRI', async () => {
        const context = new JsonLdContextNormalized({
          '@base': 'http://base.org/',
          '@vocab': 'http://vocab.org/',
          'p': { '@id': 'p', '@type': 'type' },
        });
        parser.expandPrefixedTerms(context, true);
        expect(context.getContextRaw()).toEqual({
          '@base': 'http://base.org/',
          '@vocab': 'http://vocab.org/',
          'p': { '@id': 'http://vocab.org/p', '@type': 'http://vocab.org/type' },
        });
      });

      it('should let @type fallback to base when when vocab is disabled', async () => {
        const context = new JsonLdContextNormalized({
          '@base': 'http://base.org/',
          '@vocab': null,
          'p': { '@id': 'p', '@type': 'type' },
        });
        parser.expandPrefixedTerms(context, true);
        expect(context.getContextRaw()).toEqual({
          '@base': 'http://base.org/',
          '@vocab': null,
          'p': { '@id': 'p', '@type': 'http://base.org/type' },
        });
      });

      it('should let @type fallback to base when when vocab is not present', async () => {
        const context = new JsonLdContextNormalized({
          '@base': 'http://base.org/',
          'p': { '@id': 'p', '@type': 'type' },
        });
        parser.expandPrefixedTerms(context, true);
        expect(context.getContextRaw()).toEqual({
          '@base': 'http://base.org/',
          'p': { '@id': 'p', '@type': 'http://base.org/type' },
        });
      });

      it('should not expand @type: @vocab', async () => {
        const context = new JsonLdContextNormalized({
          '@vocab': 'http://vocab.org/',
          'p': { '@id': 'p', '@type': '@vocab' },
        });
        parser.expandPrefixedTerms(context, true);
        expect(context.getContextRaw()).toEqual({
          '@vocab': 'http://vocab.org/',
          'p': { '@id': 'http://vocab.org/p', '@type': '@vocab' },
        });
      });

      it('should error on aliasing to @context', async () => {
        expect(() => parser.expandPrefixedTerms(new JsonLdContextNormalized({
          bla: '@context',
        }), true)).toThrow(new ErrorCoded(`Aliasing to certain keywords is not allowed.
Tried mapping bla to "@context"`, ERROR_CODES.INVALID_KEYWORD_ALIAS));
      });

      it('should error on aliasing to @preserve', async () => {
        expect(() => parser.expandPrefixedTerms(new JsonLdContextNormalized({
          bla: '@preserve',
        }), true)).toThrow(new ErrorCoded(`Aliasing to certain keywords is not allowed.
Tried mapping bla to "@preserve"`, ERROR_CODES.INVALID_KEYWORD_ALIAS));
      });

      it('should error on aliasing of keywords', async () => {
        expect(() => parser.expandPrefixedTerms(new JsonLdContextNormalized({
          '@id': 'http//ex.org/id',
        }), true)).toThrow(new ErrorCoded(`Keywords can not be aliased to something else.
Tried mapping @id to "http//ex.org/id"`, ERROR_CODES.KEYWORD_REDEFINITION));
      });

      it('should error on aliasing of keywords in expanded form', async () => {
        expect(() => parser.expandPrefixedTerms(new JsonLdContextNormalized({
          '@id': { '@id': 'http//ex.org/id' },
        }), true)).toThrow(new ErrorCoded(`Keywords can not be aliased to something else.
Tried mapping @id to {"@id":"http//ex.org/id"}`, ERROR_CODES.KEYWORD_REDEFINITION));
      });

      it('should error on aliasing of keywords in empty expanded form', async () => {
        expect(() => parser.expandPrefixedTerms(new JsonLdContextNormalized({
          '@id': {},
        }), true)).toThrow(new ErrorCoded(`Keywords can not be aliased to something else.
Tried mapping @id to {}`, ERROR_CODES.KEYWORD_REDEFINITION));
      });

      it('should expand aliases', async () => {
        const context = new JsonLdContextNormalized({
          id: '@id',
          url: 'id',
        });
        parser.expandPrefixedTerms(context, true);
        expect(context.getContextRaw()).toEqual({
          id: '@id',
          url: '@id',
        });
      });

      it('should not expand unknown keywords', async () => {
        const context = new JsonLdContextNormalized({
          '@vocab': 'http://example.org/',
          'ignoreMe': '@ignoreMe',
        });
        parser.expandPrefixedTerms(context, true);
        expect(context.getContextRaw()).toEqual({
          '@vocab': 'http://example.org/',
          'ignoreMe': '@ignoreMe',
        });
      });

      it('should handle @type with @protected: true', async () => {
        const context = new JsonLdContextNormalized({
          '@type': { '@protected': true },
        });
        parser.expandPrefixedTerms(context, true);
        expect(context.getContextRaw()).toEqual({
          '@type': { '@protected': true },
        });
      });

      it('should handle @type with @container: @set', async () => {
        const context = new JsonLdContextNormalized({
          '@type': { '@container': '@set' },
        });
        parser.expandPrefixedTerms(context, true);
        expect(context.getContextRaw()).toEqual({
          '@type': { '@container': '@set' },
        });
      });

      it('should handle @type with @container: @set and @protected: true', async () => {
        const context = new JsonLdContextNormalized({
          '@type': { '@container': '@set', '@protected': true },
        });
        parser.expandPrefixedTerms(context, true);
        expect(context.getContextRaw()).toEqual({
          '@type': { '@container': '@set', '@protected': true },
        });
      });

      it('error on handle @id with @protected: true', async () => {
        expect(() => parser.expandPrefixedTerms(new JsonLdContextNormalized({
          '@id': { '@protected': true },
        }), true)).toThrow(new ErrorCoded('Keywords can not be aliased to something else.' +
          '\nTried mapping @id to {"@protected":true}', ERROR_CODES.KEYWORD_REDEFINITION));
      });

      it('should error on keyword aliasing with @prefix: true', async () => {
        expect(() => parser.expandPrefixedTerms(new JsonLdContextNormalized({
          foo: { '@id': '@type', '@prefix': true },
        }), true)).toThrow(new ErrorCoded('Tried to use keyword aliases as prefix: ' +
          '\'foo\': \'{"@id":"@type","@prefix":true}\'', ERROR_CODES.INVALID_TERM_DEFINITION));
      });

      it('should not error on regular prefix definitions', async () => {
        const context = new JsonLdContextNormalized({
          foo: { '@id': 'http://foo.org/', '@prefix': true },
        });
        parser.expandPrefixedTerms(context, true);
        expect(context.getContextRaw()).toEqual({
          foo: { '@id': 'http://foo.org/', '@prefix': true },
        });
      });

      it('should handle keyword aliasing with @prefix: false', async () => {
        const context = new JsonLdContextNormalized({
          foo: { '@id': '@type', '@prefix': false },
        });
        parser.expandPrefixedTerms(context, true);
        expect(context.getContextRaw()).toEqual({
          foo: { '@id': '@type', '@prefix': false },
        });
      });

      it('should expand relative terms in expanded form without @id to @vocab', async () => {
        const context = new JsonLdContextNormalized({
          '@vocab': 'http://vocab.org/',
          'foo': {},
        });
        parser.expandPrefixedTerms(context, true);
        expect(context.getContextRaw()).toEqual({
          '@vocab': 'http://vocab.org/',
          'foo': { '@id': 'http://vocab.org/foo' },
        });
      });

      it('should expand relative terms in expanded form with empty @vocab without @id to @base', async () => {
        const context = new JsonLdContextNormalized({
          '@base': 'http://base.org/',
          '@vocab': '',
          'foo': {},
        });
        parser.expandPrefixedTerms(context, true);
        expect(context.getContextRaw()).toEqual({
          '@base': 'http://base.org/',
          '@vocab': '',
          'foo': {'@id': 'http://base.org/foo' },
        });
      });

      it('should expand relative terms in expanded form with @id to @vocab', async () => {
        const context = new JsonLdContextNormalized({
          '@vocab': 'http://vocab.org/',
          'foo': { '@id': 'rel' },
        });
        parser.expandPrefixedTerms(context, true);
        expect(context.getContextRaw()).toEqual({
          '@vocab': 'http://vocab.org/',
          'foo': { '@id': 'http://vocab.org/rel' },
        });
      });

      it('should expand relative terms in expanded form with empty @vocab with @id to @base', async () => {
        const context = new JsonLdContextNormalized({
          '@base': 'http://base.org/',
          '@vocab': '',
          'foo': { '@id': 'rel' },
        });
        parser.expandPrefixedTerms(context, true);
        expect(context.getContextRaw()).toEqual({
          '@base': 'http://base.org/',
          '@vocab': '',
          'foo': { '@id': 'http://base.org/rel' },
        });
      });

      it('should expand relative terms in compact string form with @id to @vocab', async () => {
        const context = new JsonLdContextNormalized({
          '@vocab': 'http://vocab.org/',
          'foo': 'rel',
        });
        parser.expandPrefixedTerms(context, true);
        expect(context.getContextRaw()).toEqual({
          '@vocab': 'http://vocab.org/',
          'foo': 'http://vocab.org/rel',
        });
      });

      it('should not expand keyword terms in expanded form to @vocab', async () => {
        const context = new JsonLdContextNormalized({
          '@type': { '@protected': true },
          '@vocab': 'http://vocab.org/',
        });
        parser.expandPrefixedTerms(context, true);
        expect(context.getContextRaw()).toEqual({
          '@type': { '@protected': true },
          '@vocab': 'http://vocab.org/',
        });
      });

      it('should not expand relative terms in expanded form with @id a keyword to @vocab', async () => {
        const context = new JsonLdContextNormalized({
          '@vocab': 'http://vocab.org/',
          'foo': { '@id': '@keyword' },
        });
        parser.expandPrefixedTerms(context, true);
        expect(context.getContextRaw()).toEqual({
          '@vocab': 'http://vocab.org/',
          'foo': { '@id': '@keyword' },
        });
      });

      it('should not expand relative terms in expanded form without @id without @vocab', async () => {
        const context = new JsonLdContextNormalized({
          foo: {},
        });
        parser.expandPrefixedTerms(context, true);
        expect(context.getContextRaw()).toEqual({
          foo: {},
        });
      });

      it('should not expand relative terms with @id null', async () => {
        const context = new JsonLdContextNormalized({
          '@vocab': 'http://vocab.org/',
          'foo': { '@id': null },
        });
        parser.expandPrefixedTerms(context, true);
        expect(context.getContextRaw()).toEqual({
          '@vocab': 'http://vocab.org/',
          'foo': { '@id': null },
        });
      });

      it('should not expand relative terms with @id undefined', async () => {
        const context = new JsonLdContextNormalized({
          '@vocab': 'http://vocab.org/',
          'foo': { '@id': undefined },
        });
        parser.expandPrefixedTerms(context, true);
        expect(context.getContextRaw()).toEqual({
          '@vocab': 'http://vocab.org/',
          'foo': { '@id': undefined },
        });
      });
    });

    describe('normalize', () => {
      it('should lowercase @language in 1.0', async () => {
        const context = {
          '@language': 'EN',
          'p': { '@id': 'pred1', '@language': 'NL' },
        };
        parser.normalize(context, { processingMode: 1.0 });
        expect(context).toEqual({
          '@language': 'en',
          'p': { '@id': 'pred1', '@language': 'nl' },
        });
      });

      it('should lowercase @language if normalizeLanguageTags is true', async () => {
        const context = {
          '@language': 'EN',
          'p': { '@id': 'pred1', '@language': 'NL' },
        };
        parser.normalize(context, { normalizeLanguageTags: true });
        expect(context).toEqual({
          '@language': 'en',
          'p': { '@id': 'pred1', '@language': 'nl' },
        });
      });

      it('should not lowercase @language in 1.1', async () => {
        const context = {
          '@language': 'EN',
          'p': { '@id': 'pred1', '@language': 'NL' },
        };
        parser.normalize(context, { processingMode: 1.1 });
        expect(context).toEqual({
          '@language': 'EN',
          'p': { '@id': 'pred1', '@language': 'NL' },
        });
      });

      it('should not fail on null @language', async () => {
        const context = {
          '@language': null,
          'p': { '@id': 'pred1', '@language': null },
        };
        parser.normalize(context, { processingMode: 1.0 });
        expect(context).toEqual({
          '@language': null,
          'p': { '@id': 'pred1', '@language': null },
        });
      });

      it('should not fail on invalid @language', async () => {
        const context = {
          '@language': <any> {},
          'p': { '@id': 'pred1', '@language': {} },
        };
        parser.normalize(context, { processingMode: 1.0 });
        expect(context).toEqual({
          '@language': {},
          'p': { '@id': 'pred1', '@language': {} },
        });
      });
    });

    describe('containersToHash', () => {
      it('should not modify an empty context', async () => {
        const context = {};
        parser.containersToHash(context);
        expect(context).toEqual({});
      });

      it('should not modify a context with @non-container', async () => {
        const context = {
          term: { '@non-container': 'bla' },
        };
        parser.containersToHash(context);
        expect(context).toEqual({
          term: { '@non-container': 'bla' },
        });
      });

      it('should not modify @container with a hash', async () => {
        const context = {
          term: { '@container': { 1: true, 2: true } },
        };
        parser.containersToHash(context);
        expect(context).toEqual({
          term: { '@container': { 1: true, 2: true } },
        });
      });

      it('should modify @container with an array', async () => {
        const context = {
          term: { '@container': [ '1', '2', '2' ] },
        };
        parser.containersToHash(context);
        expect(context).toEqual({
          term: { '@container': { 1: true, 2: true } },
        });
      });

      it('should arrayify @container with a string', async () => {
        const context = {
          term: { '@container': '1' },
        };
        parser.containersToHash(context);
        expect(context).toEqual({
          term: { '@container': { 1: true } },
        });
      });
    });

    describe('expandPrefixedTerms with expandContentTypeToBase false', () => {
      it('should not let @type fallback to base when when vocab is disabled', async () => {
        const context = new JsonLdContextNormalized({
          '@base': 'http://base.org/',
          '@vocab': null,
          'p': { '@id': 'p', '@type': 'type' },
        });
        parser.expandPrefixedTerms(context, false);
        expect(context.getContextRaw()).toEqual({
          '@base': 'http://base.org/',
          '@vocab': null,
          'p': { '@id': 'p', '@type': 'type' },
        });
      });

      it('should not let @type fallback to base when when vocab is not present', async () => {
        const context = new JsonLdContextNormalized({
          '@base': 'http://base.org/',
          'p': { '@id': 'p', '@type': 'type' },
        });
        parser.expandPrefixedTerms(context, false);
        expect(context.getContextRaw()).toEqual({
          '@base': 'http://base.org/',
          'p': { '@id': 'p', '@type': 'type' },
        });
      });
    });

    describe('idifyReverseTerms', () => {
      it('should not modify an empty context', async () => {
        expect(parser.idifyReverseTerms({})).toEqual({});
      });

      it('should add an @id for a @reverse', async () => {
        expect(parser.idifyReverseTerms({
          Example: { '@reverse': 'ex:Example' },
          ex: 'http://example.org/',
        })).toEqual({
          Example: { '@reverse': true, '@id': 'ex:Example' },
          ex: 'http://example.org/',
        });
      });

      it('should not add an @id for a @reverse that already has an @id', async () => {
        expect(parser.idifyReverseTerms({
          Example: { '@reverse': 'ex:Example', '@id': 'ex:AnotherExample' },
          ex: 'http://example.org/',
        })).toEqual({
          Example: { '@reverse': 'ex:Example', '@id': 'ex:AnotherExample' },
          ex: 'http://example.org/',
        });
      });

      it('should error on an invalid @reverse', async () => {
        expect(() => parser.idifyReverseTerms({
          Example: { '@reverse': 10 },
          ex: 'http://example.org/',
        })).toThrow(new ErrorCoded('Invalid @reverse value, must be absolute IRI or blank node: \'10\'',
          ERROR_CODES.INVALID_IRI_MAPPING));
      });

      it('should error on @reverse for a valid keyword', async () => {
        expect(() => parser.idifyReverseTerms({
          Example: { '@reverse': '@type' },
          ex: 'http://example.org/',
        })).toThrow(new ErrorCoded('Invalid @reverse value, must be absolute IRI or blank node: \'@type\'',
          ERROR_CODES.INVALID_IRI_MAPPING));
      });

      it('should ignore @reverse for an invalid keyword', async () => {
        expect(parser.idifyReverseTerms({
          Example: { '@reverse': '@ignoreMe' },
          ex: 'http://example.org/',
        })).toEqual({
          Example: { '@id': '@ignoreMe' },
          ex: 'http://example.org/',
        });
      });
    });

    describe('validate', () => {
      const parseDefaults = { processingMode: 1.1 };

      it('should error on an invalid @vocab', async () => {
        expect(() => parser.validate(<any> { '@vocab': true }, parseDefaults))
          .toThrow(new ErrorCoded('Found an invalid @vocab IRI: true',
            ERROR_CODES.INVALID_VOCAB_MAPPING));
      });

      it('should error on an invalid @base', async () => {
        expect(() => parser.validate(<any> { '@base': true }, parseDefaults))
          .toThrow(new ErrorCoded('Found an invalid @base IRI: true',
            ERROR_CODES.INVALID_BASE_IRI));
      });

      it('should error on an invalid @language', async () => {
        expect(() => parser.validate(<any> { '@language': true }, parseDefaults))
          .toThrow(new ErrorCoded('The value of an \'@language\' must be a string, got \'true\'',
            ERROR_CODES.INVALID_DEFAULT_LANGUAGE));
      });

      it('should error on an invalid @direction', async () => {
        expect(() => parser.validate(<any> { '@direction': true }, parseDefaults))
          .toThrow(new ErrorCoded('The value of an \'@direction\' must be a string, got \'true\'',
            ERROR_CODES.INVALID_BASE_DIRECTION));
      });

      it('should error on an invalid @version', async () => {
        expect(() => parser.validate(<any> { '@version': true }, parseDefaults))
          .toThrow(new ErrorCoded('Found an invalid @version number: true', ERROR_CODES.INVALID_VERSION_VALUE));
      });

      it('should not error on a null @language', async () => {
        expect(() => parser.validate(<any> { '@language': null }, parseDefaults))
          .not.toThrow();
      });

      it('should not error on a null @direction', async () => {
        expect(() => parser.validate(<any> { '@direction': null }, parseDefaults))
          .not.toThrow();
      });

      it('should not error on a null @version', async () => {
        expect(() => parser.validate(<any> { '@version': null }, parseDefaults))
          .not.toThrow();
      });

      it('should not error on a number @version', async () => {
        expect(() => parser.validate(<any> { '@version': 1.1 }, parseDefaults))
          .not.toThrow();
      });

      it('should error on a valid @propagate in 1.0', async () => {
        expect(() => parser.validate(<any> { '@propagate': true }, { processingMode: 1.0 }))
          .toThrow(new ErrorCoded('Found an illegal @propagate keyword: true', ERROR_CODES.INVALID_CONTEXT_ENTRY));
      });

      it('should not error on a valid @propagate in 1.1', async () => {
        expect(() => parser.validate(<any> { '@propagate': true }, parseDefaults))
          .not.toThrow();
      });

      it('should error on an invalid @propagate', async () => {
        expect(() => parser.validate(<any> { '@propagate': 'a' }, parseDefaults))
          .toThrow(new ErrorCoded('Found an invalid @propagate value: a', ERROR_CODES.INVALID_PROPAGATE_VALUE));
      });

      it('should not error on an invalid @unknown', async () => {
        expect(() => parser.validate(<any> { '@unknown': 'true' }, parseDefaults))
          .not.toThrow();
      });

      it('should error on term without @id and @type : @id', async () => {
        expect(() => parser.validate(<any> { term: {} }, parseDefaults))
          .toThrow(new ErrorCoded('Missing @id in context entry: \'term\': \'{}\'',
            ERROR_CODES.INVALID_IRI_MAPPING));
      });

      it('should error on term without @id, but with @type : @id', async () => {
        expect(() => parser.validate(<any> { term: { '@type': '@id' } }, parseDefaults))
          .toThrow(new ErrorCoded('Missing @id in context entry: \'term\': \'{"@type":"@id"}\'',
            ERROR_CODES.INVALID_IRI_MAPPING));
      });

      it('should not error on term without @id, but with @type : @id and @base', async () => {
        expect(() => parser.validate(<any> { 'term': { '@type': '@id' }, '@base': 'abc' }, parseDefaults))
          .not.toThrow();
      });

      it('should not error on term without @id and @type : @id and @base', async () => {
        expect(() => parser.validate(<any> { 'term': {}, '@base': 'abc' }, parseDefaults))
          .toThrow(new ErrorCoded('Missing @id in context entry: \'term\': \'{}\'',
            ERROR_CODES.INVALID_IRI_MAPPING));
      });

      it('should error on term without @id, but with @type : @id and @vocab', async () => {
        expect(() => parser.validate(<any> { 'term': { '@type': '@id' }, '@vocab': 'abc' }, parseDefaults))
          .toThrow(new ErrorCoded('Missing @id in context entry: \'term\': \'{"@type":"@id"}\'',
            ERROR_CODES.INVALID_IRI_MAPPING));
      });

      it('should not error on term without @id and @type : @id and @vocab', async () => {
        expect(() => parser.validate(<any> { 'term': {}, '@vocab': 'abc' }, parseDefaults))
          .not.toThrow();
      });

      it('should error when aliasing a keyword to another keyword', async () => {
        expect(() => parser.validate(<any> { '@type': { '@id': '@id' } }, parseDefaults))
          .toThrow(new ErrorCoded('Illegal keyword alias in term value, found: \'@type\': \'@id\'',
            ERROR_CODES.KEYWORD_REDEFINITION));
        expect(() => parser.validate(<any> { '@container': { '@id': '@id' } }, parseDefaults))
          .toThrow(new ErrorCoded('Illegal keyword alias in term value, found: \'@container\': \'@id\'',
            ERROR_CODES.KEYWORD_REDEFINITION));
      });

      it('should error on term with @id: @container', async () => {
        expect(() => parser.validate(<any> { term: { '@id': '@container' } }, parseDefaults))
          .toThrow(new ErrorCoded('Illegal keyword alias in term value, found: \'term\': \'{"@id":"@container"}\'',
            ERROR_CODES.INVALID_IRI_MAPPING));
      });

      it('should not error on term with @id: @type', async () => {
        expect(() => parser.validate(<any> { term: { '@id': '@type' } }, parseDefaults))
          .not.toThrow();
      });

      it('should not error on term with @id: @graph', async () => {
        expect(() => parser.validate(<any> { term: { '@id': '@graph' } }, parseDefaults))
          .not.toThrow();
      });

      it('should error on IRI term with @id: @type', async () => {
        expect(() => parser.validate(<any> { 'http://ex.org/': { '@id': '@type' } }, parseDefaults))
          .toThrow(new ErrorCoded('IRIs can not be mapped to @type, found: \'http://ex.org/\': \'{"@id":"@type"}\'',
            ERROR_CODES.INVALID_IRI_MAPPING));
      });

      it('should error on IRI term mapping an IRI to something else', async () => {
        expect(() => parser.validate(<any> { 'http://ex.org/': { '@id': 'http://something.else.com/' } },
          parseDefaults))
          .toThrow(new ErrorCoded(
            'IRIs can not be mapped to other IRIs, found: \'http://ex.org/\': \'{"@id":"http://something.else.com/"}\'',
            ERROR_CODES.INVALID_IRI_MAPPING));
      });

      it('should error on IRI term mapping a relative IRI to something else', async () => {
        expect(() => parser.validate(<any> { './relative': { '@id': 'http://something.else.com/' } },
          parseDefaults))
          .toThrow(new ErrorCoded(
            'IRIs can not be mapped to other IRIs, found: \'./relative\': \'{"@id":"http://something.else.com/"}\'',
            ERROR_CODES.INVALID_IRI_MAPPING));
      });

      it('should not error on IRI term mapping an IRI to the same IRI', async () => {
        expect(() => parser.validate(<any> { 'http://ex.org/': { '@id': 'http://ex.org/' } }, parseDefaults))
          .not.toThrow();
      });

      it('should not error on term with @id: @type in simple form', async () => {
        expect(() => parser.validate(<any> { term: '@type' }, parseDefaults))
          .not.toThrow();
      });

      it('should error on IRI term with @id: @type in simple form', async () => {
        expect(() => parser.validate(<any> { 'http://ex.org/': '@type' }, parseDefaults))
          .toThrow(new ErrorCoded('IRIs can not be mapped to @type, found: \'http://ex.org/\': \'@type\'',
            ERROR_CODES.INVALID_IRI_MAPPING));
      });

      it('should error on IRI term mapping an IRI to something else in simple form', async () => {
        expect(() => parser.validate(<any> { 'http://ex.org/': 'http://something.else.com/' },
          parseDefaults))
          .toThrow(new ErrorCoded(
            'IRIs can not be mapped to other IRIs, found: \'http://ex.org/\': \'http://something.else.com/\'',
            ERROR_CODES.INVALID_IRI_MAPPING));
      });

      it('should error on IRI term mapping a relative IRI to something else in simple form', async () => {
        expect(() => parser.validate(<any> { './relative': 'http://something.else.com/' },
          parseDefaults))
          .toThrow(new ErrorCoded(
            'IRIs can not be mapped to other IRIs, found: \'./relative\': \'http://something.else.com/\'',
            ERROR_CODES.INVALID_IRI_MAPPING));
      });

      it('should not error on IRI term mapping an IRI to the same IRI in simple form', async () => {
        expect(() => parser.validate(<any> { 'http://ex.org/': 'http://ex.org/' }, parseDefaults))
          .not.toThrow();
      });

      it('should not error on term starting with colon mapping to an IRI in simple form', async () => {
        expect(() => parser.validate(<any> { ':term': 'http://ex.org/' }, parseDefaults))
          .not.toThrow();
      });

      it('should not error on IRI term mapping an IRI to the same IRI when the key is compacted', async () => {
        expect(() => parser.validate(<any> { 'ex': 'http://ex.org/', 'ex:a': { '@id': 'http://ex.org/a' } },
          parseDefaults))
          .not.toThrow();
      });

      it('should not error on term with @id: @id', async () => {
        expect(() => parser.validate(<any> { term: { '@id': '@id' } }, parseDefaults))
          .not.toThrow();
      });

      it('should not error on term with @id: @nest', async () => {
        expect(() => parser.validate(<any> { term: { '@id': '@nest' } }, parseDefaults))
          .not.toThrow();
      });

      it('should error on term with @type: array', async () => {
        expect(() => parser.validate(<any> { term: { '@id': '@id', '@type': ['ex:a', 'ex:b'] } }, parseDefaults))
          .toThrow(new ErrorCoded(`The value of an '@type' must be a string, got '"object"'`,
            ERROR_CODES.INVALID_TYPE_MAPPING));
      });

      it('should not error on term with @type: @id', async () => {
        expect(() => parser.validate(<any> { term: { '@id': '@id', '@type': '@id' } }, parseDefaults))
          .not.toThrow();
      });

      it('should not error on term with @type: @vocab', async () => {
        expect(() => parser.validate(<any> { term: { '@id': '@id', '@type': '@vocab' } }, parseDefaults))
          .not.toThrow();
      });

      it('should not error on term with @type: @json', async () => {
        expect(() => parser.validate(<any> { term: { '@id': '@id', '@type': '@json' } }, parseDefaults))
          .not.toThrow();
      });

      it('should error on term with @type: @json in 1.0', async () => {
        expect(() => parser.validate(<any> { term: { '@id': '@id', '@type': '@json' } }, { processingMode: 1.0 }))
          .toThrow(new ErrorCoded(`A context @type must be an absolute IRI, found: 'term': '@json'`,
            ERROR_CODES.INVALID_TYPE_MAPPING));
      });

      it('should not error on term with @type: @none', async () => {
        expect(() => parser.validate(<any> { term: { '@id': '@id', '@type': '@none' } }, parseDefaults))
          .not.toThrow();
      });

      it('should error on term with @type: @none in 1.0', async () => {
        expect(() => parser.validate(<any> { term: { '@id': '@id', '@type': '@none' } }, { processingMode: 1.0 }))
          .toThrow(new ErrorCoded(`A context @type must be an absolute IRI, found: 'term': '@none'`,
            ERROR_CODES.INVALID_TYPE_MAPPING));
      });

      it('should not error on term with @type: @id with @container: @type', async () => {
        expect(() => parser.validate(
          <any> { term: { '@id': '@id', '@type': '@id', '@container': { '@type': true } } },
          parseDefaults)).not.toThrow();
      });

      it('should not error on term with @type: @vocab with @container: @type', async () => {
        expect(() => parser.validate(
          <any> { term: { '@id': '@id', '@type': '@vocab', '@container': { '@type': true } } },
          parseDefaults)).not.toThrow();
      });

      it('should error on term with @type: @none with @container: @type', async () => {
        expect(() => parser.validate(<any> { term: { '@id': '@id', '@type': '@none', '@container': '@type' } },
          parseDefaults))
          .toThrow(new ErrorCoded(`@container: @type only allows @type: @id or @vocab, but got: 'term': '@none'`,
            ERROR_CODES.INVALID_TYPE_MAPPING));
      });

      it('should error on term with @type: bla with @container: @type', async () => {
        expect(() => parser.validate(<any> {
          '@base': 'http://example.org/base/',
          '@vocab': 'http://example.org/ns/',
          'term': { '@type': 'bla', '@container': '@type' },
        },
          parseDefaults))
          .toThrow(new ErrorCoded(`@container: @type only allows @type: @id or @vocab, but got: 'term': 'bla'`,
            ERROR_CODES.INVALID_TYPE_MAPPING));
      });

      it('should error on term with @type: _:bnode', async () => {
        expect(() => parser.validate(<any> { term: { '@id': '@id', '@type': '_:bnode' } }, parseDefaults))
          .toThrow(new ErrorCoded('A context @type must be an absolute IRI, found: \'term\': \'_:bnode\'',
            ERROR_CODES.INVALID_TYPE_MAPPING));
      });

      it('should error on term with @type: invalid-iri', async () => {
        expect(() => parser.validate(<any> { term: { '@id': '@id', '@type': 'invalid-iri' } }, parseDefaults))
          .toThrow(new ErrorCoded('A context @type must be an absolute IRI, found: \'term\': \'invalid-iri\'',
            ERROR_CODES.INVALID_TYPE_MAPPING));
      });

      it('should not error on term with @reverse: true', async () => {
        expect(() => parser.validate(<any> { term: { '@id': 'http://ex.org/', '@reverse': true } }, parseDefaults))
          .not.toThrow();
      });

      it('should error on term with different @reverse and @id', async () => {
        expect(() => parser.validate(<any> { term: { '@id': 'http://ex.org/', '@reverse': 'abc' } },
          parseDefaults))
          .toThrow(
            new ErrorCoded('Found non-matching @id and @reverse term values in \'term\':\'abc\' and \'http://ex.org/\'',
              ERROR_CODES.INVALID_REVERSE_PROPERTY));
      });

      it('should not error on an @container: {}', async () => {
        expect(() => parser.validate(<any> { term: { '@id': 'http://ex.org/', '@container': {} } },
          parseDefaults))
          .not.toThrow();
      });

      it('should not error on a term with @container: @list', async () => {
        expect(() => parser.validate(<any> { term: { '@id': 'http://ex.org/', '@container': { '@list': true } } },
          parseDefaults))
          .not.toThrow();
      });

      it('should not error on a term with @container: @set', async () => {
        expect(() => parser.validate(<any> { term: { '@id': 'http://ex.org/', '@container': { '@set': true } } },
          parseDefaults))
          .not.toThrow();
      });

      it('should not error on @type with @container: @set', async () => {
        expect(() => parser.validate(<any> { '@type': { '@container': { '@set': true } } },
          parseDefaults))
          .not.toThrow();
      });

      it('should not error on @type with @container: @set and @protected: true', async () => {
        expect(() => parser.validate(<any> { '@type': { '@container': { '@set': true }, '@protected': true } },
          parseDefaults))
          .not.toThrow();
      });

      it('should not error on a term with @container: @index', async () => {
        expect(() => parser.validate(<any> { term: { '@id': 'http://ex.org/', '@container': { '@index': true } } },
          parseDefaults))
          .not.toThrow();
      });

      it('should not error on a term with @container: @index, @set', async () => {
        expect(() => parser.validate(<any>
          { term: { '@id': 'http://ex.org/', '@container': { '@index': true, '@set': true } } }, parseDefaults))
          .not.toThrow();
      });

      it('should not error on a term with @container: @index with an @index', async () => {
        expect(() => parser.validate(
          <any> { term: { '@id': 'http://ex.org/', '@container': { '@index': true }, '@index': 'prop' } },
          parseDefaults))
          .not.toThrow();
      });

      it('should error on a term with @container: @index with an @index in 1.0', async () => {
        expect(() => parser.validate(
          <any> { term: { '@id': 'http://ex.org/', '@container': { '@index': true }, '@index': 'prop' } },
          { processingMode: 1.0 }))
          .toThrow(new ErrorCoded('Attempt to add illegal key to value object: ' +
            '\'term\': \'{"@id":"http://ex.org/","@container":{"@index":true},"@index":"prop"}\'',
            ERROR_CODES.INVALID_TERM_DEFINITION));
      });

      it('should error on a term without @container: @index with an @index in 1.0', async () => {
        expect(() => parser.validate(<any> { term: { '@id': 'http://ex.org/', '@index': 'prop' } },
          { processingMode: 1.0 }))
          .toThrow(new ErrorCoded('Attempt to add illegal key to value object: ' +
            '\'term\': \'{"@id":"http://ex.org/","@index":"prop"}\'', ERROR_CODES.INVALID_TERM_DEFINITION));
      });

      it('should error on a term without @container: @index with an @index', async () => {
        expect(() => parser.validate(<any> { term: { '@id': 'http://ex.org/', '@index': 'prop' } },
          parseDefaults))
          .toThrow(new ErrorCoded('Attempt to add illegal key to value object: ' +
            '\'term\': \'{"@id":"http://ex.org/","@index":"prop"}\'', ERROR_CODES.INVALID_TERM_DEFINITION));
      });

      it('should not error on a term with @container: @language', async () => {
        expect(() => parser.validate(
          <any> { term: { '@id': 'http://ex.org/', '@container': { '@language': true } } },
          parseDefaults))
          .not.toThrow();
      });

      it('should not error on a term with @container: @language, @set', async () => {
        expect(() => parser.validate(<any>
          { term: { '@id': 'http://ex.org/', '@container': { '@language': true, '@set': true } } }, parseDefaults))
          .not.toThrow();
      });

      it('should not error on a term with @container: @id', async () => {
        expect(() => parser.validate(<any> { term: { '@id': 'http://ex.org/', '@container': { '@id': true } } },
          parseDefaults))
          .not.toThrow();
      });

      it('should not error on a term with @container: @id, @set', async () => {
        expect(() => parser.validate(
          <any> { term: { '@id': 'http://ex.org/', '@container': { '@id': true, '@set': true } } },
          parseDefaults))
          .not.toThrow();
      });

      it('should not error on a term with @container: @graph', async () => {
        expect(() => parser.validate(<any> { term: { '@id': 'http://ex.org/', '@container': { '@graph': true } } },
          parseDefaults))
          .not.toThrow();
      });

      it('should not error on a term with @container: @graph, @set', async () => {
        expect(() => parser.validate(<any>
          { term: { '@id': 'http://ex.org/', '@container': { '@graph': true, '@set': true } } }, parseDefaults))
          .not.toThrow();
      });

      it('should not error on a term with @container: @type', async () => {
        expect(() => parser.validate(<any> { term: { '@id': 'http://ex.org/', '@container': { '@type': true } } },
          parseDefaults))
          .not.toThrow();
      });

      it('should not error on a term with @container: @type, @set', async () => {
        expect(() => parser.validate(<any>
          { term: { '@id': 'http://ex.org/', '@container': { '@type': true, '@set': true } } }, parseDefaults))
          .not.toThrow();
      });

      it('should error on a term with @container: @unknown', async () => {
        expect(() => parser.validate(
          <any> { term: { '@id': 'http://ex.org/', '@container': { '@unknown': true } } },
          parseDefaults))
          .toThrow(new ErrorCoded('Invalid term @container for \'term\' (\'@unknown\'), ' +
            'must be one of @list, @set, @index, @language, @graph, @id, @type',
            ERROR_CODES.INVALID_CONTAINER_MAPPING));
      });

      it('should error on a term with @container: @id in 1.0', async () => {
        expect(() => parser.validate(
          <any> { term: { '@id': 'http://ex.org/', '@container': { '@id': true } } },
          { ... parseDefaults, processingMode: 1.0 }))
          .toThrow(new ErrorCoded('Invalid term @container for \'term\' (\'@id\') in 1.0, ' +
            'must be only one of @list, @set, @index',
            ERROR_CODES.INVALID_CONTAINER_MAPPING));
      });

      it('should error on a term with multiple @container values in 1.0', async () => {
        expect(() => parser.validate(
          <any> { term: { '@id': 'http://ex.org/', '@container': { '@list': true, '@index': true } } },
          { ... parseDefaults, processingMode: 1.0 }))
          .toThrow(new ErrorCoded('Invalid term @container for \'term\' (\'@list,@index\') in 1.0, ' +
            'must be only one of @list, @set, @index',
            ERROR_CODES.INVALID_CONTAINER_MAPPING));
      });

      it('should not error on a term with one valid @container values in 1.0', async () => {
        expect(() => parser.validate(
          <any> { term: { '@id': 'http://ex.org/', '@container': { '@list': true } } },
          { ... parseDefaults, processingMode: 1.0 })).not.toThrow();
        expect(() => parser.validate(
          <any> { term: { '@id': 'http://ex.org/', '@container': { '@set': true } } },
          { ... parseDefaults, processingMode: 1.0 })).not.toThrow();
        expect(() => parser.validate(
          <any> { term: { '@id': 'http://ex.org/', '@container': { '@index': true } } },
          { ... parseDefaults, processingMode: 1.0 })).not.toThrow();
      });

      it('should error on a term with @container: @list and @reverse', async () => {
        expect(() => parser.validate(<any>
          { term: { '@id': 'http://ex.org/', '@container': { '@list': true }, '@reverse': true } }, parseDefaults))
          .toThrow(new ErrorCoded('Term value can not be @container: @list and @reverse at the same time on \'term\'',
            ERROR_CODES.INVALID_REVERSE_PROPERTY));
      });

      it('should not error on a term with @language: en', async () => {
        expect(() => parser.validate(<any> { term: { '@id': 'http://ex.org/', '@language': 'en' } },
          parseDefaults))
          .not.toThrow();
      });

      it('should not error on a term with @direction: rtl', async () => {
        expect(() => parser.validate(<any> { term: { '@id': 'http://ex.org/', '@direction': 'rtl' } },
          parseDefaults))
          .not.toThrow();
      });

      it('should error on a term with @language: 10', async () => {
        expect(() => parser.validate(<any> { term: { '@id': 'http://ex.org/', '@language': 10 } }, parseDefaults))
          .toThrow(new ErrorCoded('The value of an \'@language\' must be a string, got \'10\'',
            ERROR_CODES.INVALID_LANGUAGE_TAGGED_VALUE));
      });

      it('should error on a term with @language: en us', async () => {
        expect(() => parser.validate(<any> { term: { '@id': 'http://ex.org/', '@language': 'en us' } },
          parseDefaults))
          .toThrow(new ErrorCoded('The value of an \'@language\' must be a valid language tag, got \'"en us"\'',
            ERROR_CODES.INVALID_LANGUAGE_TAGGED_VALUE));
      });

      it('should error on a term with @direction: abc', async () => {
        expect(() => parser.validate(<any> { term: { '@id': 'http://ex.org/', '@direction': 'abc' } },
          parseDefaults))
          .toThrow(new ErrorCoded('The value of an \'@direction\' must be \'ltr\' or \'rtl\', got \'"abc"\'',
            ERROR_CODES.INVALID_BASE_DIRECTION));
      });

      it('should error on a term with @prefix: true', async () => {
        expect(() => parser.validate(<any> { term: { '@id': 'http://ex.org/', '@prefix': true } }, parseDefaults))
          .not.toThrow();
      });

      it('should error on a term with @prefix: 10', async () => {
        expect(() => parser.validate(<any> { term: { '@id': 'http://ex.org/', '@prefix': 10 } }, parseDefaults))
          .toThrow(new ErrorCoded('Found an invalid term @prefix boolean in: \'term\': ' +
            '\'{"@id":"http://ex.org/","@prefix":10}\'', ERROR_CODES.INVALID_PREFIX_VALUE));
      });

      it('should not error on a term set to null', async () => {
        expect(() => parser.validate(<any> { term: null }, parseDefaults))
          .not.toThrow();
      });

      it('should not error on a term @id set to null', async () => {
        expect(() => parser.validate(<any> { term: { '@id': null } }, parseDefaults))
          .not.toThrow();
      });

      it('should error on a term set to a number', async () => {
        expect(() => parser.validate(<any> { term: 10 }, parseDefaults))
          .toThrow(new ErrorCoded('Found an invalid term value: \'term\': \'10\'',
            ERROR_CODES.INVALID_TERM_DEFINITION));
      });

      it('should ignore reserved internal keywords', async () => {
        expect(() => parser.validate(<any> { '@__': { '@id': '@id', '@type': '_:bnode' } }, parseDefaults))
          .not.toThrow();
        expect(() => parser.validate(<any> { '@__ignored': { '@id': '@id', '@type': '_:bnode' } }, parseDefaults))
          .not.toThrow();
        expect(() => parser.validate(<any> { '@__propagateFallback': { '@id': '@id', '@type': '_:bnode' } },
          parseDefaults))
          .not.toThrow();
      });

      it('should error on @nest: @id in expanded term definition', async () => {
        expect(() => parser.validate(<any> { key: { '@id': 'ex:id', '@nest': '@id' } }, parseDefaults))
          .toThrow(new ErrorCoded(
            'Found an invalid term @nest value in: \'key\': \'{"@id":"ex:id","@nest":"@id"}\'',
            ERROR_CODES.INVALID_NEST_VALUE));
      });

      it('should not error on @nest: @nest in expanded term definition', async () => {
        expect(() => parser.validate(<any> { key: { '@id': 'ex:id', '@nest': '@nest' } }, parseDefaults))
          .not.toThrow();
      });

      it('should not error on @nest: term in expanded term definition', async () => {
        expect(() => parser.validate(<any> { key: { '@id': 'ex:id', '@nest': 'term' } }, parseDefaults))
          .not.toThrow();
      });

      it('should error on @nest in @reverse', async () => {
        expect(() => parser.validate(<any> { key: { '@id': 'ex:id', '@reverse': true, '@nest': '@id' } },
          parseDefaults))
          .toThrow(new ErrorCoded(
            '@nest is not allowed in the reverse property \'key\'',
            ERROR_CODES.INVALID_REVERSE_PROPERTY));
      });

      it('should error on a cyclical IRI mapping in a compact term definition', async () => {
        expect(() => parser.validate(<any> { term: 'term:a' }, parseDefaults))
          .toThrow(new ErrorCoded('Detected cyclical IRI mapping in context entry: \'term\': \'"term:a"\'',
            ERROR_CODES.CYCLIC_IRI_MAPPING));
      });

      it('should error on a cyclical IRI mapping in an expanded term definition', async () => {
        expect(() => parser.validate(<any> { term: { '@id': 'term:a' } }, parseDefaults))
          .toThrow(new ErrorCoded('Detected cyclical IRI mapping in context entry: \'term\': \'{"@id":"term:a"}\'',
            ERROR_CODES.CYCLIC_IRI_MAPPING));
      });

      it('should error on non-string @id', async () => {
        expect(() => parser.validate(<any> { term: { '@id': true } }, parseDefaults))
          .toThrow(new ErrorCoded('Detected non-string @id in context entry: \'term\': \'{"@id":true}\'',
            ERROR_CODES.INVALID_IRI_MAPPING));
      });

      it('should error on empty string keys', async () => {
        expect(() => parser.validate(<any> { '': { '@id': 'http://example.org/' } }, parseDefaults))
          .toThrow(new ErrorCoded('The empty term is not allowed, got: \'\': \'{"@id":"http://example.org/"}\'',
            ERROR_CODES.INVALID_TERM_DEFINITION));
      });
    });

    describe('parse', () => {
      it('should error when parsing a context with an invalid context entry', () => {
        // @ts-expect-error
        return expect(parser.parse({ '@base': true })).rejects
          .toEqual(new ErrorCoded('Found an invalid @base IRI: true',
            ERROR_CODES.INVALID_BASE_IRI));
      });

      it('should parse an object with direct context values', () => {
        return expect(parser.parse({ name: "http://xmlns.com/foaf/0.1/name" })).resolves
          .toEqual(new JsonLdContextNormalized({
            name: "http://xmlns.com/foaf/0.1/name",
          }));
      });

      it('should parse an object with indirect context values', () => {
        return expect(parser.parse({ "@context": { name: "http://xmlns.com/foaf/0.1/name" } })).resolves
          .toEqual(new JsonLdContextNormalized({
            name: "http://xmlns.com/foaf/0.1/name",
          }));
      });

      it('should parse an object with indirect null context', () => {
        return expect(parser.parse({ "@context": null })).resolves
          .toEqual(new JsonLdContextNormalized({}));
      });

      it('should parse without modifying the original context', async () => {
        const contextIn = { "@context": { rev: { "@reverse": "http://example.com/" } } };
        await expect(parser.parse(contextIn)).resolves.toEqual(new JsonLdContextNormalized({
          rev: {
            "@id": "http://example.com/",
            "@reverse": true,
          },
        }));
        expect(contextIn).toEqual({ "@context": { rev: { "@reverse": "http://example.com/" } } });
      });

      it('should parse and normalize language tags in 1.0', async () => {
        const contextIn = {
          '@language': 'EN',
          'p': { '@id': 'pred1', '@language': 'NL' },
        };
        await expect(parser.parse(contextIn, { processingMode: 1.0 })).resolves
          .toEqual(new JsonLdContextNormalized({
            '@language': 'en',
            'p': { '@id': 'pred1', '@language': 'nl' },
          }));
      });

      it('should parse and not normalize language tags in 1.1', async () => {
        const contextIn = {
          '@language': 'EN',
          'p': { '@id': 'pred1', '@language': 'NL' },
        };
        await expect(parser.parse(contextIn, { processingMode: 1.1 })).resolves
          .toEqual(new JsonLdContextNormalized({
            '@language': 'EN',
            'p': { '@id': 'pred1', '@language': 'NL' },
          }));
      });

      it('should parse and use a relative @base IRI, when a document base IRI is given', () => {
        return expect(parser.parse({
          '@context': {
            '@base': '/sub',
            'nickname': 'http://xmlns.com/foaf/0.1/nick',
          },
        }, { baseIRI: 'http://doc.org/' }))
          .resolves.toEqual(new JsonLdContextNormalized({
            '@base': 'http://doc.org/sub',
            'nickname': 'http://xmlns.com/foaf/0.1/nick',
          }));
      });

      it('should parse and not modify an absolute @base IRI, when a document base IRI is also given', () => {
        return expect(parser.parse({
          '@context': {
            '@base': 'http://a/bb/ccc/./d;p?q',
            'nickname': 'http://xmlns.com/foaf/0.1/nick',
          },
        }, { baseIRI: 'http://doc.org/' }))
          .resolves.toEqual(new JsonLdContextNormalized({
            '@base': 'http://a/bb/ccc/./d;p?q',
            'nickname': 'http://xmlns.com/foaf/0.1/nick',
          }));
      });

      it('should parse and not modify a null @base, when a document base IRI is also given', () => {
        return expect(parser.parse({
          '@context': {
            '@base': null,
            'nickname': 'http://xmlns.com/foaf/0.1/nick',
          },
        }, { baseIRI: 'http://doc.org/' }))
          .resolves.toEqual(new JsonLdContextNormalized({
            '@base': null,
            'nickname': 'http://xmlns.com/foaf/0.1/nick',
          }));
      });

      it('should parse with a base IRI and not override the inner @base', () => {
        // @ts-expect-error
        return expect(parser.parse({ '@base': 'http://myotherexample.org/' }, 'http://myexample.org/'))
          .resolves.toEqual(new JsonLdContextNormalized({
            '@base': 'http://myotherexample.org/',
          }));
      });

      it('should parse contexts with unknown keywords', () => {
        return expect(parser.parse({
          '@vocab': 'http://example.org/',
          'ignoreMe': '@ignoreMe',
        })).resolves.toEqual(new JsonLdContextNormalized({
          '@vocab': 'http://example.org/',
          'ignoreMe': '@ignoreMe',
        }));
      });

      it('should error when parsing a prefix definition on a relative IRI against vocab', () => {
        return expect(parser.parse({
          "./something": {"@prefix": true},
          "@vocab": "http:/example.org",
        })).rejects
          .toEqual(new ErrorCoded('Invalid @prefix definition for \'./something\' (\'{"@prefix":true}\'',
            ERROR_CODES.INVALID_TERM_DEFINITION));
      });

      it('should error when parsing a prefix definition on a relative IRI against base', () => {
        return expect(parser.parse({
          "./something": {"@type": "@id", "@prefix": true},
          "@vocab": "http:/example.org",
        }, { baseIRI: 'http://base.org/' })).rejects
          .toEqual(new ErrorCoded('Invalid @prefix definition for \'./something\' (\'{"@type":"@id","@prefix":true}\'',
            ERROR_CODES.INVALID_TERM_DEFINITION));
      });

      it('should error on aliasing of @context when disallowDirectlyNestedContext is true', async () => {
        return expect(parser.parse({
          '@context': { 'p': 'ex:p' },
        }, { disallowDirectlyNestedContext: true })).rejects.toThrow(new ErrorCoded(`Keywords can not be aliased to something else.
Tried mapping @context to {"p":"ex:p"}`, ERROR_CODES.KEYWORD_REDEFINITION));
      });

      it('should not error on aliasing of @context with empty options', async () => {
        return expect(parser.parse({
          '@context': {'p': 'ex:p'},
        }, {})).resolves.toEqual(new JsonLdContextNormalized({ 'p': 'ex:p' }));
      });

      it('should not error on aliasing of @context with undefined options', async () => {
        return expect(parser.parse({
          '@context': {'p': 'ex:p'},
        })).resolves.toEqual(new JsonLdContextNormalized({ 'p': 'ex:p' }));
      });
    });

    describe('for parsing URLs', () => {
      it('should parse a valid context URL', () => {
        return expect(parser.parse('http://example.org/simple.jsonld'))
          .resolves.toEqual(new JsonLdContextNormalized({
            name: "http://xmlns.com/foaf/0.1/name",
            xsd: "http://www.w3.org/2001/XMLSchema#",
          }));
      });

      it('should parse a valid relative context URL', () => {
        return expect(parser.parse('simple.jsonld', { baseIRI: 'http://example.org/mydoc.html' }))
          .resolves.toEqual(new JsonLdContextNormalized({
            '@__baseDocument': true,
            '@base': 'http://example.org/mydoc.html',
            'name': "http://xmlns.com/foaf/0.1/name",
            'xsd': "http://www.w3.org/2001/XMLSchema#",
          }));
      });

      it('should fail to parse a relative context URL without baseIRI', () => {
        return expect(parser.parse('simple.jsonld')).rejects
          .toThrow(new Error('Invalid context IRI: simple.jsonld'));
      });

      it('should parse and ignore the @base IRI', () => {
        return expect(parser.parse('http://example.org/base.jsonld')).resolves
          .toEqual(new JsonLdContextNormalized({
            nickname: 'http://xmlns.com/foaf/0.1/nick',
          }));
      });

      it('should parse and ignore the @base IRI, but not when a custom base IRI is given', () => {
        return expect(parser.parse('http://example.org/base.jsonld', { baseIRI: 'abc' })).resolves
          .toEqual(new JsonLdContextNormalized({
            '@__baseDocument': true,
            '@base': 'abc',
            'nickname': 'http://xmlns.com/foaf/0.1/nick',
          }));
      });

      it('should parse and ignore the @base IRI, but not from the parent context', () => {
        return expect(parser.parse('http://example.org/base.jsonld', { parentContext: { '@base': 'abc' } }))
          .resolves.toEqual(new JsonLdContextNormalized({
            '@base': 'abc',
            'nickname': 'http://xmlns.com/foaf/0.1/nick',
          }));
      });

      it('should cache documents', async () => {
        // @ts-expect-error
        const spy = jest.spyOn(parser.documentLoader, 'load');

        await parser.parse('http://example.org/simple.jsonld');

        // @ts-expect-error
        expect(parser.documentCache['http://example.org/simple.jsonld']).toEqual({
          name: "http://xmlns.com/foaf/0.1/name",
          xsd: "http://www.w3.org/2001/XMLSchema#",
        });

        await expect(parser.parse('http://example.org/simple.jsonld')).resolves
          .toEqual(new JsonLdContextNormalized({
            name: "http://xmlns.com/foaf/0.1/name",
            xsd: "http://www.w3.org/2001/XMLSchema#",
          }));

        expect(spy).toHaveBeenCalledTimes(1);
      });

      it('should fail to parse an invalid source', () => {
        return expect(parser.parse('http://example.org/invalid.jsonld')).rejects.toThrow(new ErrorCoded(
          'Failed to load remote context http://example.org/invalid.jsonld: FAIL (setupJest.js)',
          ERROR_CODES.LOADING_REMOTE_CONTEXT_FAILED));
      });

      it('should error on a cyclic context', () => {
        return expect(parser.parse('http://example.org/remote_cyclic.jsonld')).rejects.toThrow(
          new ErrorCoded('Detected a cyclic context inclusion of http://example.org/remote_cyclic.jsonld',
            ERROR_CODES.RECURSIVE_CONTEXT_INCLUSION));
      });

      it('should error on an indirect cyclic context', () => {
        return expect(parser.parse('http://example.org/remote_cyclic_indirect_1.jsonld')).rejects.toThrow(
          new ErrorCoded('Detected a cyclic context inclusion of http://example.org/remote_cyclic_indirect_1.jsonld',
            ERROR_CODES.RECURSIVE_CONTEXT_INCLUSION));
      });

      it('should error when remoteContextsDepthLimit is reached', () => {
        parser = new ContextParser({ documentLoader, remoteContextsDepthLimit: 3 });
        const options = {
          remoteContexts: {
            a: true,
            b: true,
            c: true,
          },
        };
        return expect(parser.parse('http://example.org/remote_cyclic_indirect_1.jsonld', options)).rejects.toThrow(
          new ErrorCoded('Detected an overflow in remote context inclusions: a,b,c',
            ERROR_CODES.CONTEXT_OVERFLOW));
      });

      it('should parse a cyclic context via a scoped context', () => {
        return expect(parser.parse('http://example.org/remote_cyclic_scoped.jsonld'))
          .resolves.toEqual(new JsonLdContextNormalized({
            prop: {
              '@context': 'http://example.org/remote_cyclic_scoped.jsonld',
              '@id': 'ex:prop',
            },
          }));
      });

      it('should parse an indirect cyclic context via a scoped context', () => {
        return expect(parser.parse('http://example.org/remote_cyclic_scoped_indirect_1.jsonld'))
          .resolves.toEqual(new JsonLdContextNormalized({
            prop: {
              '@context': {
                "@__baseDocument": true,
                "@base": "http://example.org/remote_cyclic_scoped_indirect_1.jsonld",
                prop: {
                  '@context': 'http://example.org/remote_cyclic_scoped_indirect_1.jsonld',
                  '@id': 'ex:prop',
                },
              },
              '@id': 'ex:prop',
            },
          }));
      });

      it('should parse another indirect cyclic context via a scoped context', () => {
        return expect(parser.parse('http://example.org/remote_cyclic_scoped2_indirect_1.jsonld'))
          .resolves.toEqual(new JsonLdContextNormalized({
            prop: {
              '@context': 'http://example.org/remote_cyclic_scoped2_indirect_1.jsonld',
              '@id': 'ex:prop',
            },
          }));
      });

      it('should parse a cyclic context via a scoped context in an array', () => {
        return expect(parser.parse('http://example.org/remote_cyclic_scoped_array.jsonld'))
          .resolves.toEqual(new JsonLdContextNormalized({
            prop: {
              '@context': [
                'http://example.org/remote_cyclic_scoped_array.jsonld',
              ],
              '@id': 'ex:prop',
            },
          }));
      });

      it('should error on a remote context without @context', () => {
        return expect(parser.parse('http://example.org/remote_context_invalid.jsonld')).rejects.toThrow(new ErrorCoded(
          'Missing @context in remote context at http://example.org/context_no_root.jsonld',
          ERROR_CODES.INVALID_REMOTE_CONTEXT));
      });
    });

    describe('for parsing null', () => {
      it('should parse to an empty context', () => {
        return expect(parser.parse(null)).resolves.toEqual(new JsonLdContextNormalized({}));
      });

      it('should parse to an empty context, even when a parent context is given', () => {
        return expect(parser.parse(null, { parentContext: { a: 'b' } })).resolves
          .toEqual(new JsonLdContextNormalized({}));
      });

      it('should parse to an empty context, but set @base if needed', () => {
        return expect(parser.parse(null, { baseIRI: 'http://base.org/' })).resolves
          .toEqual(new JsonLdContextNormalized({ '@__baseDocument': true, '@base': 'http://base.org/' }));
      });
    });

    describe('for parsing arrays', () => {
      it('should parse an empty array to the parent context', () => {
        const parentContext = { a: 'b' };
        return expect(parser.parse([], { parentContext })).resolves
          .toEqual(new JsonLdContextNormalized(parentContext));
      });

      it('should parse an array with one string', () => {
        return expect(parser.parse([
          'http://example.org/simple.jsonld',
        ])).resolves.toEqual(new JsonLdContextNormalized({
          name: "http://xmlns.com/foaf/0.1/name",
          xsd: "http://www.w3.org/2001/XMLSchema#",
        }));
      });

      it('should parse an array with two strings', () => {
        return expect(parser.parse([
          'http://example.org/simple.jsonld',
          'http://example.org/simple2.jsonld',
        ])).resolves.toEqual(new JsonLdContextNormalized({
          name: "http://xmlns.com/foaf/0.1/name",
          nickname: "http://xmlns.com/foaf/0.1/nick",
          xsd: "http://www.w3.org/2001/XMLSchema#",
        }));
      });

      it('should parse an array with relative string URLs', () => {
        return expect(parser.parse([
          'simple.jsonld',
          'simple2.jsonld',
        ], { baseIRI: 'http://example.org/mybase.html' })).resolves.toEqual(new JsonLdContextNormalized({
          '@__baseDocument': true,
          '@base': 'http://example.org/mybase.html',
          'name': "http://xmlns.com/foaf/0.1/name",
          'nickname': "http://xmlns.com/foaf/0.1/nick",
          'xsd': "http://www.w3.org/2001/XMLSchema#",
        }));
      });

      it('should parse an array with an object and a string', () => {
        return expect(parser.parse([
          {
            npmd: "https://linkedsoftwaredependencies.org/bundles/npm/",
          },
          'http://example.org/simple2.jsonld',
        ])).resolves.toEqual(new JsonLdContextNormalized({
          nickname: "http://xmlns.com/foaf/0.1/nick",
          npmd: "https://linkedsoftwaredependencies.org/bundles/npm/",
        }));
      });

      it('should parse an array with an object and a string resolving to an array when cached', () => {
        // @ts-expect-error
        parser.documentCache['http://example.org/simplearray.jsonld'] = [{
          nickname: 'http://xmlns.com/foaf/0.1/nick',
        }];
        return expect(parser.parse([
          {
            npmd: "https://linkedsoftwaredependencies.org/bundles/npm/",
          },
          'http://example.org/simplearray.jsonld',
        ])).resolves.toEqual(new JsonLdContextNormalized({
          nickname: "http://xmlns.com/foaf/0.1/nick",
          npmd: "https://linkedsoftwaredependencies.org/bundles/npm/",
        }));
      });

      it('should parse and expand prefixes', () => {
        return expect(parser.parse([
          'http://example.org/simple.jsonld',
          {
            myint: { "@id": "xsd:integer" },
          },
        ])).resolves.toEqual(new JsonLdContextNormalized({
          myint: { "@id": "http://www.w3.org/2001/XMLSchema#integer" },
          name: "http://xmlns.com/foaf/0.1/name",
          xsd: "http://www.w3.org/2001/XMLSchema#",
        }));
      });

      it('should handle @base relative to each other', () => {
        return expect(parser.parse([
          {
            '@base': 'one/',
          },
          {
            '@base': 'two/',
          },
        ], { baseIRI: 'http://doc.org/' })).resolves.toEqual(new JsonLdContextNormalized({
          '@base': 'http://doc.org/one/two/',
        }));
      });

      it('should handle an array with @base in only first entry', () => {
        return expect(parser.parse([
          {
            '@base': 'one/',
          },
          {

          },
        ], { baseIRI: 'http://doc.org/' })).resolves.toEqual(new JsonLdContextNormalized({
          '@base': 'http://doc.org/one/',
        }));
      });

      it('should expand terms when a new conflicting @vocab is introduced', () => {
        return expect(parser.parse([
          {
            "@vocab": "http://vocab.org/",
            "bar": {},
          },
          {
            "@vocab": "http://vocab.1.org/",
          },
        ], { baseIRI: 'http://doc.org/' })).resolves.toEqual(new JsonLdContextNormalized({
          '@__baseDocument': true,
          "@base": "http://doc.org/",
          "@vocab": "http://vocab.1.org/",
          "bar": { "@id": "http://vocab.org/bar" },
        }));
      });

      it('should expand terms with @id when a new conflicting @vocab is introduced', () => {
        return expect(parser.parse([
          {
            "@vocab": "http://vocab.org/",
            "bar": { "@id": "rel" },
          },
          {
            "@vocab": "http://vocab.1.org/",
          },
        ], { baseIRI: 'http://doc.org/' })).resolves.toEqual(new JsonLdContextNormalized({
          '@__baseDocument': true,
          "@base": "http://doc.org/",
          "@vocab": "http://vocab.1.org/",
          "bar": { "@id": "http://vocab.org/rel" },
        }));
      });

      it('should expand string terms when a new conflicting @vocab is introduced', () => {
        return expect(parser.parse([
          {
            "@vocab": "http://vocab.org/",
            "bar": "rel",
          },
          {
            "@vocab": "http://vocab.1.org/",
          },
        ], { baseIRI: 'http://doc.org/' })).resolves.toEqual(new JsonLdContextNormalized({
          '@__baseDocument': true,
          "@base": "http://doc.org/",
          "@vocab": "http://vocab.1.org/",
          "bar": "http://vocab.org/rel",
        }));
      });

      it('should error on a cyclic context', () => {
        return expect(parser.parse(['http://example.org/remote_cyclic.jsonld'])).rejects.toThrow(
          new ErrorCoded('Detected a cyclic context inclusion of http://example.org/remote_cyclic.jsonld',
            ERROR_CODES.RECURSIVE_CONTEXT_INCLUSION));
      });

      it('should error on an indirect cyclic context', () => {
        return expect(parser.parse(['http://example.org/remote_cyclic_indirect_1.jsonld'])).rejects.toThrow(
          new ErrorCoded('Detected a cyclic context inclusion of http://example.org/remote_cyclic_indirect_1.jsonld',
            ERROR_CODES.RECURSIVE_CONTEXT_INCLUSION));
      });

      it('should parse a cyclic context via a scoped context', () => {
        return expect(parser.parse(['http://example.org/remote_cyclic_scoped.jsonld']))
          .resolves.toEqual(new JsonLdContextNormalized({
            prop: {
              '@context': 'http://example.org/remote_cyclic_scoped.jsonld',
              '@id': 'ex:prop',
            },
          }));
      });

      it('should parse an indirect cyclic context via a scoped context', () => {
        return expect(parser.parse(['http://example.org/remote_cyclic_scoped_indirect_1.jsonld']))
          .resolves.toEqual(new JsonLdContextNormalized({
            prop: {
              '@context': {
                "@__baseDocument": true,
                "@base": "http://example.org/remote_cyclic_scoped_indirect_1.jsonld",
                prop: {
                  '@context': 'http://example.org/remote_cyclic_scoped_indirect_1.jsonld',
                  '@id': 'ex:prop',
                },
              },
              '@id': 'ex:prop',
            },
          }));
      });
    });

    describe('for base and vocab', () => {
      it('should parse with a base IRI', () => {
        return expect(parser.parse('http://example.org/simple.jsonld', { baseIRI: 'http://myexample.org/' }))
          .resolves.toEqual(new JsonLdContextNormalized({
            '@__baseDocument': true,
            '@base': 'http://myexample.org/',
            'name': "http://xmlns.com/foaf/0.1/name",
            'xsd': "http://www.w3.org/2001/XMLSchema#",
          }));
      });

      it('should parse with a base IRI and not override the inner @base', () => {
        return expect(parser.parse({ '@base': 'http://myotherexample.org/' }, { baseIRI: 'http://myexample.org/' }))
          .resolves.toEqual(new JsonLdContextNormalized({
            '@base': 'http://myotherexample.org/',
          }));
      });

      it('should parse relative @vocab with parent context @vocab in active 1.1', () => {
        const parentContext = { '@vocab': 'http://example.org/' };
        return expect(parser.parse({ '@vocab': 'vocab/' }, { parentContext, processingMode: 1.1 }))
          .resolves.toEqual(new JsonLdContextNormalized({
            '@vocab': 'http://example.org/vocab/',
          }));
      });

      it('should parse relative (empty) @vocab with parent context @vocab in active 1.1', () => {
        const parentContext = { '@vocab': 'http://example.org/' };
        return expect(parser.parse({ '@vocab': '' }, { parentContext, processingMode: 1.1 }))
          .resolves.toEqual(new JsonLdContextNormalized({
            '@vocab': 'http://example.org/',
          }));
      });

      it('should not see null @vocab as relative @vocab', () => {
        const parentContext = { '@vocab': 'http://example.org/' };
        return expect(parser.parse({ '@vocab': null }, { parentContext, processingMode: 1.1 }))
          .resolves.toEqual(new JsonLdContextNormalized({
            '@vocab': null,
          }));
      });

      it('should parse relative @vocab without parent context @vocab in active 1.1', () => {
        return expect(parser.parse({ '@vocab': 'vocab/' }, { parentContext: {}, processingMode: 1.1 }))
          .resolves.toEqual(new JsonLdContextNormalized({
            '@vocab': 'vocab/',
          }));
      });

      it('should not parse relative @vocab with parent context @vocab in 1.0', () => {
        const parentContext = { '@vocab': 'http://example.org/' };
        return expect(parser.parse({ '@vocab': 'vocab/', '@version': 1.0 }, { parentContext }))
          .resolves.toEqual(new JsonLdContextNormalized({
            '@version': 1.0,
            '@vocab': 'vocab/',
          }));
      });

      it('should not parse relative (empty) @vocab with parent context @vocab in 1.0', () => {
        const parentContext = { '@vocab': 'http://example.org/' };
        return expect(parser.parse({ '@vocab': '', '@version': 1.0 }, { parentContext }))
          .resolves.toEqual(new JsonLdContextNormalized({
            '@version': 1.0,
            '@vocab': '',
          }));
      });

      it('should not parse relative @vocab without parent context @vocab in 1.0', () => {
        return expect(parser.parse({ '@vocab': 'vocab/', '@version': 1.0 }, { parentContext: {} }))
          .resolves.toEqual(new JsonLdContextNormalized({
            '@version': 1.0,
            '@vocab': 'vocab/',
          }));
      });

      it('should parse relative @vocab with parent context @vocab in 1.1', () => {
        const parentContext = { '@vocab': 'http://example.org/' };
        return expect(parser.parse({ '@vocab': 'vocab/', '@version': 1.1 }, { parentContext }))
          .resolves.toEqual(new JsonLdContextNormalized({
            '@version': 1.1,
            '@vocab': 'http://example.org/vocab/',
          }));
      });

      it('should parse relative (empty) @vocab with parent context @vocab in 1.1', () => {
        const parentContext = { '@vocab': 'http://example.org/' };
        return expect(parser.parse({ '@vocab': '', '@version': 1.1 }, { parentContext }))
          .resolves.toEqual(new JsonLdContextNormalized({
            '@version': 1.1,
            '@vocab': 'http://example.org/',
          }));
      });

      it('should parse relative @vocab without parent context @vocab in 1.1', () => {
        return expect(parser.parse({ '@vocab': 'vocab/', '@version': 1.1 }, { parentContext: {} }))
          .resolves.toEqual(new JsonLdContextNormalized({
            '@version': 1.1,
            '@vocab': 'vocab/',
          }));
      });

      it('should parse compact @vocab in 1.1', () => {
        return expect(parser.parse({ '@vocab': 'ex:vocab/', '@version': 1.1, ex: {
          '@id': 'http://example.org/',
          '@prefix': true
        }}, {}))
          .resolves.toEqual(new JsonLdContextNormalized({
            '@version': 1.1,
            '@vocab': 'http://example.org/vocab/',
            ex: {
              '@id': 'http://example.org/',
              '@prefix': true
            },
          }));
      });

      it('should parse compact @vocab in 1.1 that equals a prefix', () => {
        return expect(parser.parse({ '@vocab': 'ex', '@version': 1.1, ex: {
          '@id': 'http://example.org/',
          '@prefix': true
        }}, {}))
          .resolves.toEqual(new JsonLdContextNormalized({
            '@version': 1.1,
            '@vocab': 'http://example.org/',
            ex: {
              '@id': 'http://example.org/',
              '@prefix': true
            },
          }));
      });

      it('should not expand @type in @container: @type', () => {
        return expect(parser.parse({
          '@base': 'http://example.org/base/',
          '@vocab': 'http://example.org/ns/',
          'foo': { '@type': 'literal', '@container': '@type' },
        }, { parentContext: {} }))
          .rejects.toThrow(new ErrorCoded('A context @type must be an absolute IRI, found: \'foo\': \'literal\'',
            ERROR_CODES.INVALID_TYPE_VALUE));
      });

      it('should expand @type in @container: @set', () => {
        return expect(parser.parse({
          '@base': 'http://example.org/base/',
          '@vocab': 'http://example.org/ns/',
          'foo': { '@type': 'literal', '@container': '@set' },
        }, { parentContext: {} }))
          .resolves.toEqual(new JsonLdContextNormalized({
            '@base': 'http://example.org/base/',
            '@vocab': 'http://example.org/ns/',
            'foo': {
              '@container': { '@set': true },
              '@id': 'http://example.org/ns/foo',
              '@type': 'http://example.org/ns/literal',
            },
          }));
      });

      it('should revert back to baseIRI from options when context is nullified', () => {
        return expect(parser.parse(null, {
          baseIRI: 'http://myexample.org/',
          parentContext: { '@base': 'http://ignoreMe.com' },
        }))
          .resolves.toEqual(new JsonLdContextNormalized({
            '@__baseDocument': true,
            '@base': 'http://myexample.org/',
          }));
      });
    });

    describe('for protected terms', () => {
      it('should parse a single protected term', () => {
        return expect(parser.parse({
          name: {
            '@id': 'http://xmlns.com/foaf/0.1/name',
            '@protected': true,
          },
        }, { processingMode: 1.1 })).resolves.toEqual(new JsonLdContextNormalized({
          name: {
            '@id': 'http://xmlns.com/foaf/0.1/name',
            '@protected': true,
          },
        }));
      });

      it('should parse 2 contexts where one is protected', () => {
        return expect(parser.parse([
          {
            "@version": 1.0,
            "ex":"https://example.org/ns/"
          },
          {
            "@version": 1.1,
            "@protected": true,
            "VerifiableCredential": {
              "@id": "https://www.w3.org/2018/credentials#VerifiableCredential",
            }
          }
        ])).resolves.toEqual(new JsonLdContextNormalized({
          "@version": 1.1,
          VerifiableCredential: {
            "@id": "https://www.w3.org/2018/credentials#VerifiableCredential",
            "@protected": true,
          },
          ex: "https://example.org/ns/"
        }));
      });

      const contexts = [
        {
          "@version": 1.1,
          "@protected": true,
          "VerifiableCredential": {
            "@id": "https://www.w3.org/2018/credentials#VerifiableCredential",
          }
        },
        {
          "ex":"https://example.org/ns/",
          "@version": 1.1,
          "@protected": false,
        }
      ];

      const result = new JsonLdContextNormalized({
        "@version": 1.1,
        "@protected": false,
        VerifiableCredential: {
          "@id": "https://www.w3.org/2018/credentials#VerifiableCredential",
          "@protected": true,
        },
        ex: "https://example.org/ns/"
      });

      it('should parse 2 contexts where one is protected and one globally has protected false', () => {
        return expect(parser.parse(contexts)).resolves.toEqual(result);
      });

      it('should parse 2 contexts where one is protected and one globally has protected false [reverse order]', () => {
        return expect(parser.parse([contexts[1], contexts[0]])).resolves.toEqual(result);
      });

      const BASIC_VC_CONTEXT = {
        "@version": 1.1,
        "@protected": true,
        "VerifiableCredential": {
          "@id": "https://www.w3.org/2018/credentials#VerifiableCredential",
        }
      }

      it('protected context should override the unprotected context', () => {
        return expect(parser.parse([
          {
            "@version": 1.0,
            "VerifiableCredential":"https://example.org/ns/"
          },
          BASIC_VC_CONTEXT
        ])).resolves.toEqual(new JsonLdContextNormalized({
          "@version": 1.1,
          VerifiableCredential: {
            "@id": "https://www.w3.org/2018/credentials#VerifiableCredential",
            "@protected": true,
          }
        }));
      });

      describe('with imported contexts', () => {
        beforeEach(() => {
          jest.mocked(globalThis.fetch).mockImplementationOnce(async (...args) => {
            return new Response(JSON.stringify({
              "@context": {
                "MyType": {
                  "@id": "http://example.org#MyType",
                }
              }
            }), { headers: new Headers([
              ['content-type', 'application/ld+json']
            ]) })
          });
        });

        it('protected should be applied to the imported context', () => {
          return expect(parser.parse([
            {
              ...BASIC_VC_CONTEXT,
              "@import": "http://example.org/imported/context"
            }
          ])).resolves.toEqual(new JsonLdContextNormalized({
            "@version": 1.1,
            VerifiableCredential: {
              "@id": "https://www.w3.org/2018/credentials#VerifiableCredential",
              "@protected": true,
            },
            MyType: {
              "@id": "http://example.org#MyType",
              "@protected": true,
            }
          }));
        });

        it.each([
          ['child', [BASIC_VC_CONTEXT, {"@import": "http://example.org/imported/context"}]],
          ['parent', [{"@import": "http://example.org/imported/context"}, BASIC_VC_CONTEXT]],
        ])('protected should not be applied to the imported contexts in other %s contexts', (_, context) => {
          return expect(parser.parse(context)).resolves.toEqual(new JsonLdContextNormalized({
            "@version": 1.1,
            VerifiableCredential: {
              "@id": "https://www.w3.org/2018/credentials#VerifiableCredential",
              "@protected": true,
            },
            MyType: { "@id": "http://example.org#MyType" }
          }));
        });
      });


      describe('with imported contexts containing the @protected keyword', () => {

        const BASIC_VC_CONTEXT_WITHOUT_PROTECTED = {
          "@version": 1.1,
          "VerifiableCredential": {
            "@id": "https://www.w3.org/2018/credentials#VerifiableCredential",
          }
        }

        beforeEach(() => {
          jest.mocked(globalThis.fetch).mockImplementationOnce(async (...args) => {
            return new Response(JSON.stringify({
              "@context": {
                "@protected": true,
                "MyType": "http://example.org#MyType"
              }
            }), { headers: new Headers([
              ['content-type', 'application/ld+json']
            ]) })
          });
        });

        it('protected should be applied to the imported context', () => {
          return expect(parser.parse([
            {
              ...BASIC_VC_CONTEXT_WITHOUT_PROTECTED,
              "@import": "http://example.org/imported/context"
            }
          ])).resolves.toEqual(new JsonLdContextNormalized({
            "@version": 1.1,
            VerifiableCredential: {
              "@id": "https://www.w3.org/2018/credentials#VerifiableCredential",
            },
            MyType: {
              "@id": "http://example.org#MyType",
              "@protected": true,
            }
          }));
        });

        it.each([
          ['child', [BASIC_VC_CONTEXT_WITHOUT_PROTECTED, {"@import": "http://example.org/imported/context"}]],
          ['parent', [{"@import": "http://example.org/imported/context"}, BASIC_VC_CONTEXT_WITHOUT_PROTECTED]],
        ])('protected should not be applied to the imported contexts in other %s contexts', (_, context) => {
          return expect(parser.parse(context)).resolves.toEqual(new JsonLdContextNormalized({
            "@version": 1.1,
            VerifiableCredential: {
              "@id": "https://www.w3.org/2018/credentials#VerifiableCredential",
            },
            MyType: { "@id": "http://example.org#MyType", "@protected": true }
          }));
        });
      });

      it('should parse 2 contexts where one is protected', () => {
        return expect(parser.parse([
          {"ex":"https://example.org/ns/"},
          {
            "@version": 1.1,
            "@protected": true,
            "VerifiableCredential": {
              "@id": "https://www.w3.org/2018/credentials#VerifiableCredential",
            }
          }
        ])).resolves.toEqual(new JsonLdContextNormalized({
          "@version": 1.1,
          VerifiableCredential: {
            "@id": "https://www.w3.org/2018/credentials#VerifiableCredential",
            "@protected": true,
          },
          ex: "https://example.org/ns/"
        }));
      });

      it('should parse a single keyword alias', () => {
        return expect(parser.parse({
          id: {
            '@id': '@id',
            '@protected': true,
          },
        }, { processingMode: 1.1 })).resolves.toEqual(new JsonLdContextNormalized({
          id: {
            '@id': '@id',
            '@protected': true,
          },
        }));
      });

      it('should parse context-level @protected', () => {
        return expect(parser.parse({
          '@protected': true,
          'knows': 'http://xmlns.com/foaf/0.1/knows',
          'name': 'http://xmlns.com/foaf/0.1/name',
        }, { processingMode: 1.1 })).resolves.toEqual(new JsonLdContextNormalized({
          knows: {
            '@id': 'http://xmlns.com/foaf/0.1/knows',
            '@protected': true,
          },
          name: {
            '@id': 'http://xmlns.com/foaf/0.1/name',
            '@protected': true,
          },
        }));
      });

      it('should parse context-level @protected with local overrides', () => {
        return expect(parser.parse({
          '@protected': true,
          'knows': {
            '@id': 'http://xmlns.com/foaf/0.1/knows',
            '@protected': false,
          },
          'name': {
            '@id': 'http://xmlns.com/foaf/0.1/name',
          },
        }, { processingMode: 1.1 })).resolves.toEqual(new JsonLdContextNormalized({
          knows: {
            '@id': 'http://xmlns.com/foaf/0.1/knows',
            '@protected': false,
          },
          name: {
            '@id': 'http://xmlns.com/foaf/0.1/name',
            '@protected': true,
          },
        }));
      });

      it('should parse context-level @protected with a keyword alias', () => {
        return expect(parser.parse({
          '@protected': true,
          'id': '@id',
        }, { processingMode: 1.1 })).resolves.toEqual(new JsonLdContextNormalized({
          id: {
            '@id': '@id',
            '@protected': true,
          },
        }));
      });

      it('should error on a protected term with override', () => {
        return expect(parser.parse([
          {
            name: {
              '@id': 'http://xmlns.com/foaf/0.1/name',
              '@protected': true,
            },
          },
          {
            name: 'http://schema.org/name',
          },
        ], { processingMode: 1.1 })).rejects.toThrow(new ErrorCoded(
          'Attempted to override the protected keyword name from ' +
          '"http://xmlns.com/foaf/0.1/name" to "http://schema.org/name"',
          ERROR_CODES.PROTECTED_TERM_REDEFINITION));
      });

      it('should error on a protected null term with override', () => {
        return expect(parser.parse([
          {
            "@version": 1.1,
            "@protected": true,
            "term": null
          }, {
            "@version": 1.1,
            "term": {"@id": "http://example.com/term"}
          }
        ], { processingMode: 1.1 })).rejects.toThrow(new ErrorCoded(
          'Attempted to override the protected keyword term from null to \"http://example.com/term\"',
          ERROR_CODES.PROTECTED_TERM_REDEFINITION));
      });

      it('should error on a protected term with override when the overriding version is 1.0', () => {
        return expect(parser.parse([
          {
            name: {
              '@id': 'http://xmlns.com/foaf/0.1/name',
              '@protected': true,
            },
          },
          {
            "@version": 1.0,
            name: 'http://schema.org/name',
          },
        ])).rejects.toThrow(new ErrorCoded(
          'Attempted to override the protected keyword name from ' +
          '"http://xmlns.com/foaf/0.1/name" to "http://schema.org/name"',
          ERROR_CODES.PROTECTED_TERM_REDEFINITION));
      });

      it('should error on an outer scope protected term with override of another protected term', () => {
        return expect(parser.parse([
          {
            "VerifiableCredential":"https://example.org/ns/",
            "@protected": true
          },
          {
            "@version": 1.1,
            "@protected": true,
            "VerifiableCredential": {
              "@id": "https://www.w3.org/2018/credentials#VerifiableCredential",
            }
          }
        ], { processingMode: 1.1 })).rejects.toThrow(new ErrorCoded(
          'Attempted to override the protected keyword VerifiableCredential from ' +
          '"https://example.org/ns/" to "https://www.w3.org/2018/credentials#VerifiableCredential"',
          ERROR_CODES.PROTECTED_TERM_REDEFINITION));
      });

      it('should error on an outer scope protected term with override', () => {
        return expect(parser.parse([
          {
            '@protected': true,
            name: {
              '@id': 'http://xmlns.com/foaf/0.1/name',
            },
          },
          {
            name: 'http://schema.org/name',
          },
        ], { processingMode: 1.1 })).rejects.toThrow(new ErrorCoded(
          'Attempted to override the protected keyword name from ' +
          '"http://xmlns.com/foaf/0.1/name" to "http://schema.org/name"',
          ERROR_CODES.PROTECTED_TERM_REDEFINITION));
      });

      it('should not error on a protected term with override if ignoreProtection is true', () => {
        return expect(parser.parse([
          {
            name: {
              '@id': 'http://xmlns.com/foaf/0.1/name',
              '@protected': true,
            },
          },
          {
            name: 'http://schema.org/name',
          },
        ], { processingMode: 1.1, ignoreProtection: true })).resolves.toEqual(new JsonLdContextNormalized({
          name: 'http://schema.org/name',
        }));
      });

      it('should not error on a protected term with nullification if ignoreProtection is true', () => {
        return expect(parser.parse([
          {
            name: {
              '@id': 'http://xmlns.com/foaf/0.1/name',
              '@protected': true,
            },
          },
          null,
        ], { processingMode: 1.1, ignoreProtection: true })).resolves
          .toEqual(new JsonLdContextNormalized({}));
      });

      it('should error on a protected term with nullification if ignoreProtection is false', () => {
        return expect(parser.parse([
          {
            name: {
              '@id': 'http://xmlns.com/foaf/0.1/name',
              '@protected': true,
            },
          },
          null,
        ], { processingMode: 1.1, ignoreProtection: false })).rejects
          .toThrow(new ErrorCoded('Illegal context nullification when terms are protected',
            ERROR_CODES.INVALID_CONTEXT_NULLIFICATION));
      });

      it('should not error on a non-protected term with nullification if ignoreProtection is true', () => {
        return expect(parser.parse([
          {
            name: {
              '@id': 'http://xmlns.com/foaf/0.1/name',
            },
          },
          null,
        ], { processingMode: 1.1, ignoreProtection: true })).resolves
          .toEqual(new JsonLdContextNormalized({}));
      });

      it('should error on a protected keyword alias with override', () => {
        return expect(parser.parse([
          {
            id: {
              '@id': '@id',
              '@protected': true,
            },
          },
          {
            id: 'http://schema.org/id',
          },
        ], { processingMode: 1.1 })).rejects.toThrow(new ErrorCoded(
          'Attempted to override the protected keyword id from "@id" to "http://schema.org/id"',
          ERROR_CODES.PROTECTED_TERM_REDEFINITION));
      });

      it('should parse a protected term with semantically identical (string-based) override', () => {
        return expect(parser.parse([
          {
            name: {
              '@id': 'http://xmlns.com/foaf/0.1/name',
              '@protected': true,
            },
          },
          {
            name: 'http://xmlns.com/foaf/0.1/name',
          },
        ], { processingMode: 1.1 })).resolves.toEqual(new JsonLdContextNormalized({
          name: {
            '@id': 'http://xmlns.com/foaf/0.1/name',
            '@protected': true,
          },
        }));
      });

      it('should parse a protected term with identical (object-based) override (mod @protected)', () => {
        return expect(parser.parse([
          {
            name: {
              '@id': 'http://xmlns.com/foaf/0.1/name',
              '@protected': true,
            },
          },
          {
            name: {
              '@id': 'http://xmlns.com/foaf/0.1/name',
            },
          },
        ], { processingMode: 1.1 })).resolves.toEqual(new JsonLdContextNormalized({
          name: {
            '@id': 'http://xmlns.com/foaf/0.1/name',
            '@protected': true,
          },
        }));
      });

      it('should parse a protected term with identical (object-based) override', () => {
        return expect(parser.parse([
          {
            name: {
              '@id': 'http://xmlns.com/foaf/0.1/name',
              '@protected': true,
            },
          },
          {
            name: {
              '@id': 'http://xmlns.com/foaf/0.1/name',
              '@protected': true,
            },
          },
        ], { processingMode: 1.1 })).resolves.toEqual(new JsonLdContextNormalized({
          name: {
            '@id': 'http://xmlns.com/foaf/0.1/name',
            '@protected': true,
          },
        }));
      });

      it('should parse a protected keyword alias with identical (object-based) override (mod @protected)', () => {
        return expect(parser.parse([
          {
            id: {
              '@id': '@id',
              '@protected': true,
            },
          },
          {
            id: {
              '@id': '@id',
            },
          },
        ], { processingMode: 1.1 })).resolves.toEqual(new JsonLdContextNormalized({
          id: {
            '@id': '@id',
            '@protected': true,
          },
        }));
      });

      it('should parse a protected keyword alias with identical (object-based) override', () => {
        return expect(parser.parse([
          {
            id: {
              '@id': '@id',
              '@protected': true,
            },
          },
          {
            id: {
              '@id': '@id',
              '@protected': true,
            },
          },
        ], { processingMode: 1.1 })).resolves.toEqual(new JsonLdContextNormalized({
          id: {
            '@id': '@id',
            '@protected': true,
          },
        }));
      });

      it('should parse a term that becomes protected later on', () => {
        return expect(parser.parse([
          {
            name: 'http://xmlns.com/foaf/0.1/name',
          },
          {
            name: {
              '@id': 'http://xmlns.com/foaf/0.1/name',
              '@protected': true,
            },
          },
        ], { processingMode: 1.1 })).resolves.toEqual(new JsonLdContextNormalized({
          name: {
            '@id': 'http://xmlns.com/foaf/0.1/name',
            '@protected': true,
          },
        }));
      });

      it('should parse a global protected keyword alias with identical (object-based) override (mod @protected)',
        () => {
          return expect(parser.parse([
            {
              '@protected': true,
              'id': '@id',
            },
            {
              id: '@id',
            },
          ], { processingMode: 1.1 })).resolves.toEqual(new JsonLdContextNormalized({
            id: {
              '@id': '@id',
              '@protected': true,
            },
          }));
        });

      it('should parse a global protected keyword alias with identical (object-based) override', () => {
        return expect(parser.parse([
          {
            '@protected': true,
            'id': '@id',
          },
          {
            '@protected': true,
            'id': '@id',
          },
        ], { processingMode: 1.1 })).resolves.toEqual(new JsonLdContextNormalized({
          id: {
            '@id': '@id',
            '@protected': true,
          },
        }));
      });

      it('should parse a globally protected string term with identical override', () => {
        return expect(parser.parse([
          {
            '@protected': true,
            'name': 'http://xmlns.com/foaf/0.1/name',
          },
          {
            '@protected': true,
            'name': 'http://xmlns.com/foaf/0.1/name',
          },
        ], { processingMode: 1.1 })).resolves.toEqual(new JsonLdContextNormalized({
          name: {
            '@id': 'http://xmlns.com/foaf/0.1/name',
            '@protected': true,
          },
        }));
      });

      it('should parse a globally protected string term ending in gen-delim with identical override', () => {
        return expect(parser.parse([
          {
            '@protected': true,
            'foo': 'http://example/foo#',
          },
          {
            '@protected': true,
            'foo': 'http://example/foo#',
          },
        ], { processingMode: 1.1 })).resolves.toEqual(new JsonLdContextNormalized({
          foo: {
            '@id': 'http://example/foo#',
            '@prefix': true,
            '@protected': true,
          },
        }));
      });

      it('should parse a globally protected string term ending in gen-delim', () => {
        return expect(parser.parse([
          {
            '@protected': true,
            'foo': 'http://example/foo#',
          }
        ], { processingMode: 1.1 })).resolves.toEqual(new JsonLdContextNormalized({
          foo: {
            '@id': 'http://example/foo#',
            '@prefix': true,
            '@protected': true,
          },
        }));
      });

      it('should parse a globally protected string term ending in non-gen-delim with identical override', () => {
        return expect(parser.parse([
          {
            '@protected': true,
            'foo': 'http://example/foo',
          },
          {
            '@protected': true,
            'foo': 'http://example/foo',
          },
        ], { processingMode: 1.1 })).resolves.toEqual(new JsonLdContextNormalized({
          foo: {
            '@id': 'http://example/foo',
            '@protected': true,
          },
        }));
      });

      it('should parse protected terms with a scoped context', () => {
        return expect(parser.parse([
          {
            "@protected": true,
            "bar": {
              "@context": {
                "bar-1": {
                  "@id": "http://example/bar-1",
                },
              },
              "@id": "http://example/bar",
            },
          },
          {
            "@protected": true,
            "bar": {
              "@context": {
                "bar-1": {
                  "@id": "http://example/bar-1",
                },
              },
              "@id": "http://example/bar",
            },
          },
        ], { processingMode: 1.1 })).resolves.toEqual(new JsonLdContextNormalized({
          bar: {
            "@context": {
              "bar-1": {
                "@id": "http://example/bar-1",
              },
            },
            "@id": "http://example/bar",
            "@protected": true,
          },
        }));
      });

      it('should parse protected terms with a scoped context and document baseIRI', () => {
        return expect(parser.parse([
          {
            "@protected": true,
            "bar": {
              "@context": {
                "bar-1": {
                  "@id": "http://example/bar-1",
                },
              },
              "@id": "http://example/bar",
            },
          },
          {
            "@protected": true,
            "bar": {
              "@context": {
                "bar-1": {
                  "@id": "http://example/bar-1",
                },
              },
              "@id": "http://example/bar",
            },
          },
        ], { processingMode: 1.1, baseIRI: 'http://base.org/' })).resolves.toEqual(new JsonLdContextNormalized({
          '@__baseDocument': true,
          "@base": "http://base.org/",
          "bar": {
            "@context": {
              '@__baseDocument': true,
              "@base": "http://base.org/",
              "bar-1": {
                "@id": "http://example/bar-1",
              },
            },
            "@id": "http://example/bar",
            "@protected": true,
          },
        }));
      });

      it('should parse protected terms that are expanded vs compact', async() => {
        await expect(parser.parse({
          "@protected": true,
          "foo": "http://ex.org/foo",
          "Type": {
            "@id": "http://ex.org/Type",
            "@context": {
              "ex": "http://ex.org/",
              "foo": "ex:foo"
            }
          },
        }, { processingMode: 1.1, baseIRI: 'http://base.org/' })).resolves.toEqual(new JsonLdContextNormalized({
          '@__baseDocument': true,
          "@base": "http://base.org/",
          "foo": {
            "@id": "http://ex.org/foo",
            "@protected": true
          },
          "Type": {
            "@id": "http://ex.org/Type",
            "@protected": true,
            "@context": {
              '@__baseDocument': true,
              "@base": "http://base.org/",
              "ex": "http://ex.org/",
              "foo": "ex:foo"
            }
          },
        }));

        await expect(parser.parse([
          {
            "@protected": true,
            "foo": "http://ex.org/foo",
          },
          {
            "@protected": true,
            "ex": "http://ex.org/",
            "foo": "ex:foo"
          }
        ], { processingMode: 1.1, baseIRI: 'http://base.org/' })).resolves.toEqual(new JsonLdContextNormalized({
          '@__baseDocument': true,
          "@base": "http://base.org/",
          "ex": {
            "@id": "http://ex.org/",
            "@prefix": true,
            "@protected": true
          },
          "foo": {
            "@id": "http://ex.org/foo",
            "@protected": true
          },
        }));
      });
    });

    it('should parse a complex context', () => {
      // tslint:disable:object-literal-sort-keys
      // tslint:disable:max-line-length
      return expect(parser.parse('http://example.org/complex.jsonld')).resolves.toEqual(new JsonLdContextNormalized({
        "@vocab": "unknown://",
        "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
        "xsd": "http://www.w3.org/2001/XMLSchema#",
        "oo": "https://linkedsoftwaredependencies.org/vocabularies/object-oriented#",
        "Module": {
          "@id": "https://linkedsoftwaredependencies.org/vocabularies/object-oriented#Module",
        },
        "Class": {
          "@id": "https://linkedsoftwaredependencies.org/vocabularies/object-oriented#Class",
        },
        "AbstractClass": {
          "@id": "https://linkedsoftwaredependencies.org/vocabularies/object-oriented#AbstractClass",
        },
        "Instance": {
          "@id": "https://linkedsoftwaredependencies.org/vocabularies/object-oriented#ComponentInstance",
        },
        "components": {
          "@id": "https://linkedsoftwaredependencies.org/vocabularies/object-oriented#component",
        },
        "parameters": {
          "@id": "https://linkedsoftwaredependencies.org/vocabularies/object-oriented#parameter",
        },
        "constructorArguments": {
          "@id": "https://linkedsoftwaredependencies.org/vocabularies/object-oriented#constructorArguments",
          "@container": { "@list": true },
        },
        "unique": {
          "@id": "https://linkedsoftwaredependencies.org/vocabularies/object-oriented#uniqueValue",
        },
        "required": {
          "@id": "https://linkedsoftwaredependencies.org/vocabularies/object-oriented#required",
        },
        "default": {
          "@id": "https://linkedsoftwaredependencies.org/vocabularies/object-oriented#defaultValue",
        },
        "defaultScoped": {
          "@id": "https://linkedsoftwaredependencies.org/vocabularies/object-oriented#defaultScoped",
        },
        "defaultScope": {
          "@id": "https://linkedsoftwaredependencies.org/vocabularies/object-oriented#defaultScope",
          "@type": "@id",
        },
        "defaultScopedValue": {
          "@id": "https://linkedsoftwaredependencies.org/vocabularies/object-oriented#defaultScopedValue",
        },
        "arguments": {
          "@id": "https://linkedsoftwaredependencies.org/vocabularies/object-oriented#arguments",
          "@container": { "@list": true },
        },
        "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
        "comment": {
          "@id": "http://www.w3.org/2000/01/rdf-schema#comment",
          "@type": "@id",
        },
        "extends": {
          "@id": "http://www.w3.org/2000/01/rdf-schema#subClassOf",
          "@type": "@id",
        },
        "range": {
          "@id": "http://www.w3.org/2000/01/rdf-schema#range",
          "@type": "@id",
        },
        "owl": "http://www.w3.org/2002/07/owl#",
        "import": {
          "@id": "http://www.w3.org/2002/07/owl#imports",
        },
        "InheritanceValue": {
          "@id": "http://www.w3.org/2002/07/owl#Restriction",
        },
        "inheritValues": {
          "@id": "http://www.w3.org/2000/01/rdf-schema#subClassOf",
          "@type": "@id",
        },
        "onParameter": {
          "@id": "http://www.w3.org/2002/07/owl#onProperty",
          "@type": "@id",
        },
        "from": {
          "@id": "http://www.w3.org/2002/07/owl#allValuesFrom",
          "@type": "@id",
        },
        "doap": "http://usefulinc.com/ns/doap#",
        "requireName": {
          "@id": "http://usefulinc.com/ns/doap#name",
        },
        "requireElement": {
          "@id": "https://linkedsoftwaredependencies.org/vocabularies/object-oriented#componentPath",
        },
        "om": "https://linkedsoftwaredependencies.org/vocabularies/object-mapping#",
        "ObjectMapping": {
          "@id": "https://linkedsoftwaredependencies.org/vocabularies/object-mapping#ObjectMapping",
        },
        "ArrayMapping": {
          "@id": "https://linkedsoftwaredependencies.org/vocabularies/object-mapping#ArrayMapping",
        },
        "fields": {
          "@id": "https://linkedsoftwaredependencies.org/vocabularies/object-mapping#field",
          "@type": "https://linkedsoftwaredependencies.org/vocabularies/object-mapping#ObjectMapEntry",
        },
        "elements": {
          "@id": "https://linkedsoftwaredependencies.org/vocabularies/object-mapping#elements",
          "@type": "@id",
          "@container": { "@list": true },
        },
        "collectEntries": {
          "@id": "https://linkedsoftwaredependencies.org/vocabularies/object-mapping#collectsEntriesFrom",
          "@type": "@id",
        },
        "keyRaw": {
          "@id": "https://linkedsoftwaredependencies.org/vocabularies/object-mapping#fieldName",
        },
        "key": {
          "@id": "https://linkedsoftwaredependencies.org/vocabularies/object-mapping#fieldName",
          "@type": "@id",
        },
        "value": {
          "@id": "https://linkedsoftwaredependencies.org/vocabularies/object-mapping#fieldValue",
          "@type": "@id",
        },
        "valueRaw": {
          "@id": "https://linkedsoftwaredependencies.org/vocabularies/object-mapping#fieldValue",
        },
        "valueRawReference": {
          "@id": "https://linkedsoftwaredependencies.org/vocabularies/object-mapping#fieldValueRaw",
          "@type": "@id",
        },
        "npmd": "https://linkedsoftwaredependencies.org/bundles/npm/",
        "cais": "https://linkedsoftwaredependencies.org/bundles/npm/@comunica/actor-init-sparql/",
        "ActorInitSparql": "https://linkedsoftwaredependencies.org/bundles/npm/@comunica/actor-init-sparql/Actor/Init/Sparql",
        "mediatorQueryOperation": "https://linkedsoftwaredependencies.org/bundles/npm/@comunica/actor-init-sparql/mediatorQueryOperation",
        "mediatorSparqlParse": "https://linkedsoftwaredependencies.org/bundles/npm/@comunica/actor-init-sparql/mediatorSparqlParse",
        "mediatorSparqlSerialize": "https://linkedsoftwaredependencies.org/bundles/npm/@comunica/actor-init-sparql/mediatorSparqlSerialize",
        "mediatorSparqlSerializeMediaTypeCombiner": "https://linkedsoftwaredependencies.org/bundles/npm/@comunica/actor-init-sparql/mediatorSparqlSerializeMediaTypeCombiner",
        "mediatorContextPreprocess": "https://linkedsoftwaredependencies.org/bundles/npm/@comunica/actor-init-sparql/mediatorContextPreprocess",
      }));
      // tslint:enable:object-literal-sort-keys
      // tslint:enable:max-line-length
    });

    describe('for parsing invalid values', () => {
      it('should error when parsing true', () => {
        // @ts-expect-error
        return expect(parser.parse(true)).rejects
          .toEqual(new ErrorCoded('Tried parsing a context that is not a string, array or object, but got true',
            ERROR_CODES.INVALID_LOCAL_CONTEXT));
      });

      it('should error when parsing false', () => {
        // @ts-expect-error
        return expect(parser.parse(false)).rejects
          .toEqual(new ErrorCoded('Tried parsing a context that is not a string, array or object, but got false',
            ERROR_CODES.INVALID_LOCAL_CONTEXT));
      });

      it('should error when parsing a number', () => {
        // @ts-expect-error
        return expect(parser.parse(1)).rejects
          .toEqual(new ErrorCoded('Tried parsing a context that is not a string, array or object, but got 1',
            ERROR_CODES.INVALID_LOCAL_CONTEXT));
      });
    });

    describe('for scoped contexts', () => {
      it('should preload remote URLs', () => {
        return expect(parser.parse({
          prop: {
            '@context': 'http://example.org/simple.jsonld',
            '@id': 'http://ex.org/prop',
          },
        }, { processingMode: 1.1 })).resolves.toEqual(new JsonLdContextNormalized({
          prop: {
            '@context': {
              name: "http://xmlns.com/foaf/0.1/name",
              xsd: "http://www.w3.org/2001/XMLSchema#",
            },
            '@id': 'http://ex.org/prop',
          },
        }));
      });

      it('should preload remote URLs in an array', () => {
        return expect(parser.parse({
          prop: {
            '@context': [
              'http://example.org/simple.jsonld',
              'http://example.org/simple2.jsonld',
            ],
            '@id': 'http://ex.org/prop',
          },
        }, { processingMode: 1.1 })).resolves.toEqual(new JsonLdContextNormalized({
          prop: {
            '@context': [
              {
                name: "http://xmlns.com/foaf/0.1/name",
                xsd: "http://www.w3.org/2001/XMLSchema#",
              },
              {
                nickname: "http://xmlns.com/foaf/0.1/nick",
              },
            ],
            '@id': 'http://ex.org/prop',
          },
        }));
      });

      it('should preload a combination of remote URLs and objects in an array', () => {
        return expect(parser.parse({
          prop: {
            '@context': [
              'http://example.org/simple.jsonld',
              'http://example.org/simple2.jsonld',
              {
                bla: 'http://bla.org/',
              },
            ],
            '@id': 'http://ex.org/prop',
          },
        }, { processingMode: 1.1 })).resolves.toEqual(new JsonLdContextNormalized({
          prop: {
            '@context': [
              {
                name: "http://xmlns.com/foaf/0.1/name",
                xsd: "http://www.w3.org/2001/XMLSchema#",
              },
              {
                nickname: "http://xmlns.com/foaf/0.1/nick",
              },
              {
                bla: 'http://bla.org/',
              },
            ],
            '@id': 'http://ex.org/prop',
          },
        }));
      });

      it('should not expand prefixes in scoped contexts', () => {
        return expect(parser.parse({
          prop: {
            '@context': {
              prefix: 'http://ex.org/',
              value: 'prefix:value',
            },
            '@id': 'http://ex.org/prop',
          },
        }, { processingMode: 1.1 })).resolves.toEqual(new JsonLdContextNormalized({
          prop: {
            '@context': {
              prefix: 'http://ex.org/',
              value: 'prefix:value',
            },
            '@id': 'http://ex.org/prop',
          },
        }));
      });

      it('should not modify null inner contexts', () => {
        return expect(parser.parse({
          prop: {
            '@context': null,
            '@id': 'http://ex.org/prop',
          },
        }, { processingMode: 1.1 })).resolves.toEqual(new JsonLdContextNormalized({
          prop: {
            '@context': null,
            '@id': 'http://ex.org/prop',
          },
        }));
      });

      it('should error on invalid scoped contexts', () => {
        return expect(parser.parse({
          '@version': 1.1,
          't1': {
            '@context': {
              t2: {
                // Missing @id here
                '@context': {
                  type: null,
                },
              },
            },
            '@id': 'ex:t1',
          },
        }, { processingMode: 1.1 })).rejects.toThrow(new ErrorCoded(
          'Missing @id in context entry: \'t2\': \'{"@context":{"type":null}}\'',
          ERROR_CODES.INVALID_SCOPED_CONTEXT));
      });

      it('should not error on invalid scoped contexts if skipValidation is true', () => {
        parser = new ContextParser({ documentLoader, skipValidation: true });
        return expect(parser.parse({
          '@version': 1.1,
          't1': {
            '@context': {
              t2: {
                // Missing @id here
                '@context': {
                  type: null,
                },
              },
            },
            '@id': 'ex:t1',
          },
        }, {processingMode: 1.1})).resolves.toEqual(new JsonLdContextNormalized({
          '@version': 1.1,
          't1': {
            '@context': {
              t2: {
                // Missing @id here
                '@context': {
                  type: null,
                },
              },
            },
            '@id': 'ex:t1',
          },
        }));
      });

      it('should not error on valid scoped contexts that are invalid on their own', () => {
        return expect(parser.parse({
          '@vocab': 'http://example/',
          'foo': {
            '@context': {
              baz: {
                '@type': '@vocab',
              },
            },
          },
        }, { processingMode: 1.1 })).resolves.toEqual(new JsonLdContextNormalized({
          '@vocab': 'http://example/',
          'foo': {
            '@context': {
              baz: {
                '@type': '@vocab',
              },
            },
            '@id': 'http://example/foo',
          },
        }));
      });

      it('should not error on valid scoped contexts with containers that are invalid on their own', () => {
        return expect(parser.parse({
          '@vocab': 'http://example/',
          'foo': {
            '@context': {
              baz: 'http://example.org/baz',
            },
          },
          'typemap': {
            '@container': '@type',
          },
        }, { processingMode: 1.1 })).resolves.toEqual(new JsonLdContextNormalized({
          '@vocab': 'http://example/',
          'foo': {
            '@context': {
              baz: 'http://example.org/baz',
            },
            '@id': 'http://example/foo',
          },
          'typemap': {
            '@container': {
              '@type': true,
            },
            '@id': 'http://example/typemap',
          },
        }));
      });

      it('should not error on valid scoped contexts in arrays that are invalid on their own', () => {
        return expect(parser.parse([{
          "@protected": true,
          "@version": 1.1,
          "@vocab": "http://example.com/",
          "Parent": {"@context": {"@protected": true, "foo": {"@type": "@id"}}},
        }, {
          "@protected": true,
          "@version": 1.1,
          "Child": {"@context": {"@protected": true, "foo": {"@type": "@id"}}},
        }], { processingMode: 1.1, baseIRI: 'http://base.org/' })).resolves.toEqual(new JsonLdContextNormalized({
          '@__baseDocument': true,
          "@base": "http://base.org/",
          "@version": 1.1,
          "@vocab": "http://example.com/",
          "Child": {
            "@context": {
              "@__baseDocument": true,
              "@base": "http://base.org/",
              "@protected": true, "foo": {"@type": "@id"},
            },
            "@id": "http://example.com/Child",
            "@protected": true,
          },
          "Parent": {
            "@context": {
              "@__baseDocument": true,
              "@base": "http://base.org/",
              "@protected": true, "foo": {"@type": "@id"},
            },
            "@id": "http://example.com/Parent",
            "@protected": true,
          },
        }));
      });

      it('should expand keys without @id based on the correct @vocab', () => {
        return expect(parser.parse({
          '@vocab': 'http://vocab.org/',
          'Foo': {
            '@context': {
              '@vocab': 'http://vocab.1.org/',
            },
            '@id': 'http://ex.org/Foo',
          },
          'prop': {},
        }, { processingMode: 1.1 })).resolves.toEqual(new JsonLdContextNormalized({
          '@vocab': 'http://vocab.org/',
          'Foo': {
            '@context': {
              '@vocab': 'http://vocab.1.org/',
            },
            '@id': 'http://ex.org/Foo',
          },
          'prop': { '@id': 'http://vocab.org/prop' },
        }));
      });

      it('should handle array-based inner contexts', () => {
        return expect(parser.parse({
          'Foo': {
            '@context': [
              'http://example.org/simple.jsonld',
              {
                'id': null,
                'type': null
              }
            ],
            '@id': 'http://ex.org/Foo',
          },
        }, { processingMode: 1.1 })).resolves.toEqual(new JsonLdContextNormalized({
          'Foo': {
            '@context': [
              {
                'name': 'http://xmlns.com/foaf/0.1/name',
                'xsd': 'http://www.w3.org/2001/XMLSchema#',
              },
              {
                'id': null,
                'type': null
              }
            ],
            '@id': 'http://ex.org/Foo',
          },
        }));
      });

      it('should handle nested array-based inner contexts', () => {
        return expect(parser.parse({
          'service': {
            '@type': '@id',
            '@id': 'ex:service',
            '@context': {
              'Foo1': {
                '@id': 'ex:Foo1',
                '@context': [
                  'http://example.org/simple.jsonld',
                  {
                    'id': null,
                    'type': null
                  }
                ],
              },
              'Foo2': {
                '@id': 'ex:Foo2',
                '@context': [
                  'http://example.org/simple.jsonld',
                  {
                    'id': null,
                    'type': null
                  }
                ],
              },
            },
          },
        }, { processingMode: 1.1 })).resolves.toEqual(new JsonLdContextNormalized({
          'service': {
            '@type': '@id',
            '@id': 'ex:service',
            '@context': {
              'Foo1': {
                '@id': 'ex:Foo1',
                '@context': [
                  'http://example.org/simple.jsonld',
                  {
                    'id': null,
                    'type': null
                  }
                ],
              },
              'Foo2': {
                '@id': 'ex:Foo2',
                '@context': [
                  'http://example.org/simple.jsonld',
                  {
                    'id': null,
                    'type': null
                  }
                ],
              },
            },
          },
        }));
      });
    });

    describe('for contexts with @import', () => {
      it('should load an existing context', () => {
        return expect(parser.parse({
          '@context': {
            '@import': 'http://example.org/simple.jsonld',
          },
        })).resolves.toEqual(new JsonLdContextNormalized({
          name: "http://xmlns.com/foaf/0.1/name",
          xsd: "http://www.w3.org/2001/XMLSchema#",
        }));
      });

      it('should fail to load a non-existing context', () => {
        return expect(parser.parse({
          '@context': {
            '@import': 'http://example.org/404.jsonld',
          },
        })).rejects.toThrow(new ErrorCoded(
          'Failed to load remote context http://example.org/404.jsonld: FAIL (setupJest.js)',
          ERROR_CODES.INVALID_REMOTE_CONTEXT));
      });

      it('should error on @import on an array', () => {
        return expect(parser.parse({
          '@context': {
            '@import': [ 'http://example.org/simple.jsonld' ],
          },
        })).rejects.toThrow(new ErrorCoded('An @import value must be a string, but got object',
          ERROR_CODES.INVALID_IMPORT_VALUE));
      });

      it('should error on @import on an object', () => {
        return expect(parser.parse({
          '@context': {
            '@import': {},
          },
        })).rejects.toThrow(new ErrorCoded('An @import value must be a string, but got object',
          ERROR_CODES.INVALID_IMPORT_VALUE));
      });

      it('should error on @import on remote context with an array', () => {
        return expect(parser.parse({
          '@context': {
            '@import': 'http://example.org/array.jsonld',
          },
        })).rejects.toThrow(new ErrorCoded('An imported context must be a single object: ' +
          'http://example.org/array.jsonld',
          ERROR_CODES.INVALID_REMOTE_CONTEXT));
      });

      it('should error on @import on remote context with another @import', () => {
        return expect(parser.parse({
          '@context': {
            '@import': 'http://example.org/import.jsonld',
          },
        })).rejects.toThrow(new ErrorCoded('An imported context can not import another context: ' +
          'http://example.org/import.jsonld',
          ERROR_CODES.INVALID_REMOTE_CONTEXT));
      });

      it('should error in 1.0', () => {
        return expect(parser.parse({
          '@context': {
            '@import': 'http://example.org/simple.jsonld',
          },
        }, { processingMode: 1.0 })).rejects.toThrow(new ErrorCoded('Context importing is not supported in JSON-LD 1.0',
          ERROR_CODES.INVALID_CONTEXT_ENTRY));
      });

      it('should convert containers to hash values after loading context', async () => {
        const parsed = await parser.loadImportContext('http://example.org/simple_with_container.jsonld');

        expect(parsed).toEqual({
          rdfs: "https://www.w3.org/2000/01/rdf-schema#",
          label: {
            "@id": "rdfs:label",
            "@container": {
              "@language": true,
            },
          },
        });
      });
    });

    describe('#validateKeywordRedefinitions', () => {
      it('should return true when validating over the same context', async () => {
        const context = new JsonLdContextNormalized({
          '@base': 'http://base.org/',
          '@vocab': 'http://vocab.org/',
          'p': 'http://vocab.org/p',
        });
        expect(parser.validateKeywordRedefinitions(context, context)).toBeFalsy();
      });
    });

    describe('#parseInnerContexts', () => {
      it('return the same context when calling parseInnerContexts on a context with no inner contexts', async () => {
        const context = new JsonLdContextNormalized({
          '@base': 'http://base.org/',
          '@vocab': 'http://vocab.org/',
          'p': 'http://vocab.org/p',
        });
        expect(parser.parseInnerContexts(context, {})).resolves.toEqual(context);
      });
    });
  });
});
