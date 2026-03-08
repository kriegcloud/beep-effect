import {defaultExpandOptions} from "../lib/JsonLdContextNormalized";
import {ERROR_CODES, ErrorCoded} from "../lib/ErrorCoded";
import {JsonLdContextNormalized} from "../lib/JsonLdContextNormalized";

describe('JsonLdContextNormalized', () => {
  describe('#expandTerm', () => {
    describe('in vocab-mode', () => {
      it('to return when no prefix applies', async () => {
        const context = new JsonLdContextNormalized({def: 'DEF/'});
        expect(context.expandTerm('abc:123', true)).toBe('abc:123');
      });

      it('to return when no prefix applies without @id', async () => {
        const context = new JsonLdContextNormalized({def: {}});
        expect(context.expandTerm('def:123', true)).toBe('def:123');
      });

      it('to return when no term applies without @id', async () => {
        const context = new JsonLdContextNormalized({def: {}});
        expect(context.expandTerm('def', true)).toBe('def');
      });

      it('to return when a prefix applies', async () => {
        const context = new JsonLdContextNormalized({def: 'DEF/'});
        expect(context.expandTerm('def:123', true)).toBe('DEF/123');
      });

      it('to return when a prefix applies with @id', async () => {
        const context = new JsonLdContextNormalized({def: { '@id': 'DEF/' }});
        expect(context.expandTerm('def:123', true)).toBe('def:123');
      });

      it('to return when it is a prefix', async () => {
        const context = new JsonLdContextNormalized({def: 'http://DEF/'});
        expect(context.expandTerm('def', true)).toBe('http://DEF/');
      });

      it('to return when it is a prefix with colon', async () => {
        const context = new JsonLdContextNormalized({def: 'DEF/'});
        expect(context.expandTerm('def:', true)).toBe('DEF/');
      });

      it('to return when a direct value applies', async () => {
        const context = new JsonLdContextNormalized({abc: 'http://DEF'});
        expect(context.expandTerm('abc', true)).toBe('http://DEF');
      });

      it('to return when @vocab exists but not applies', async () => {
        const context = new JsonLdContextNormalized({'@vocab': 'bbb/'});
        expect(context.expandTerm('def:123', true)).toBe('def:123');
      });

      it('to return when @vocab exists and applies', async () => {
        const context = new JsonLdContextNormalized({'@vocab': 'http://bbb/'});
        expect(context.expandTerm('def', true))
          .toBe('http://bbb/def');
      });

      it('to return when @vocab exists and applies, but the context key references itself', async () => {
        const context = new JsonLdContextNormalized({'@vocab': 'http://bbb/', 'def': 'def'});
        expect(context.expandTerm('def', true)).
        toBe('http://bbb/def');
      });

      it('to return when @vocab exists and applies, but is disabled', async () => {
        const context = new JsonLdContextNormalized({'@vocab': 'bbb/', 'def': null});
        expect(context.expandTerm('def', true)).toBe(null);
      });

      it('to return when @vocab exists and applies, but is disabled via @id', async () => {
        const context = new JsonLdContextNormalized({'@vocab': 'bbb/', 'def': { '@id': null }});
        expect(context.expandTerm('def', true)).toBe(null);
      });

      it('to return when @base exists but not applies', async () => {
        const context = new JsonLdContextNormalized({'@base': 'bbb/'});
        expect(context.expandTerm('def:123', true)).toBe('def:123');
      });

      it('to return when @base exists and applies', async () => {
        const context = new JsonLdContextNormalized({'@base': 'bbb/'});
        expect(context.expandTerm('def', true)).toBe('def');
      });

      it('to return when @base exists and applies, but is disabled', async () => {
        const context = new JsonLdContextNormalized({'@base': 'bbb/', 'def': null});
        expect(context.expandTerm('def', true)).toBe(null);
      });

      it('to return when @base exists and applies, but is disabled via @id', async () => {
        const context = new JsonLdContextNormalized({'@base': 'bbb/', 'def': { '@id': null }});
        expect(context.expandTerm('def', true)).toBe(null);
      });

      it('to return when a term and prefix applies', async () => {
        const context = new JsonLdContextNormalized({
          bla: 'http://DEF/123',
          def: 'http://DEF/',
        });
        expect(context.expandTerm('bla', true)).toBe('http://DEF/123');
      });

      it('to throw for not allowed relative @vocab', async () => {
        const context = new JsonLdContextNormalized({
          '@vocab': 'relative/',
        });
        const opts = {
          ...defaultExpandOptions,
          allowVocabRelativeToBase: false,
        };
        expect(() => context.expandTerm('bla', true, opts)).toThrow(new ErrorCoded(
          'Relative vocab expansion for term \'bla\' with vocab \'relative/\' is not allowed.',
          ERROR_CODES.INVALID_VOCAB_MAPPING));
      });

      it('to throw for unsupported relative empty @vocab', async () => {
        const context = new JsonLdContextNormalized({
          '@vocab': '',
        });
        const opts = {
          ...defaultExpandOptions,
          allowVocabRelativeToBase: false,
        };
        expect(() => context.expandTerm('bla', true, opts)).toThrow(new ErrorCoded(
          'Relative vocab expansion for term \'bla\' with vocab \'\' is not allowed.',
          ERROR_CODES.INVALID_VOCAB_MAPPING));
      });

      it('to return when @vocab is empty string and @base does not exist', async () => {
        const context = new JsonLdContextNormalized({'@vocab': ''});
        expect(context.expandTerm('def', true)).toBe('def');
      });

      it('to return when @vocab is empty string and @base exists', async () => {
        const context = new JsonLdContextNormalized({'@vocab': '', '@base': 'http://ex.org/'});
        expect(context.expandTerm('def', true))
          .toBe('http://ex.org/def');
      });

      it('to return when @vocab is empty string and @base exists if allowVocabRelativeToBase is true', async () => {
        const context = new JsonLdContextNormalized({'@vocab': '', '@base': 'http://ex.org/'});
        const opts = {
          ...defaultExpandOptions,
          allowVocabRelativeToBase: true,
        };
        expect(context.expandTerm('def', true, opts)).toBe('http://ex.org/def');
      });

      it('to throw when @vocab is empty string and @base exists if allowVocabRelativeToBase is false', async () => {
        const context = new JsonLdContextNormalized({'@vocab': '', '@base': 'http://ex.org/'});
        const opts = {
          ...defaultExpandOptions,
          allowVocabRelativeToBase: false,
        };
        expect(() => context.expandTerm('def', true, opts)).toThrow(new ErrorCoded(
          'Relative vocab expansion for term \'def\' with vocab \'\' is not allowed.',
          ERROR_CODES.INVALID_VOCAB_MAPPING));
      });

      it('to return when @vocab is "#" and @base exists if allowVocabRelativeToBase is true', async () => {
        const context = new JsonLdContextNormalized({'@vocab': '#', '@base': 'http://ex.org/'});
        const opts = {
          ...defaultExpandOptions,
          allowVocabRelativeToBase: true,
        };
        expect(context.expandTerm('def', true, opts)).toBe('http://ex.org/#def');
      });

      it('to throw when @vocab is "#" string and @base exists if allowVocabRelativeToBase is false', async () => {
        const context = new JsonLdContextNormalized({'@vocab': '#', '@base': 'http://ex.org/'});
        const opts = {
          ...defaultExpandOptions,
          allowVocabRelativeToBase: false,
        };
        expect(() => context.expandTerm('def', true,
          opts)).toThrow(new ErrorCoded(
          'Relative vocab expansion for term \'def\' with vocab \'#\' is not allowed.',
          ERROR_CODES.INVALID_VOCAB_MAPPING));
      });

      it('to return when @vocab is "../#" and @base exists if allowVocabRelativeToBase is true', async () => {
        const context = new JsonLdContextNormalized({'@vocab': '../#', '@base': 'http://ex.org/abc/'});
        const opts = {
          ...defaultExpandOptions,
          allowVocabRelativeToBase: true,
        };
        expect(context.expandTerm('def', true, opts)).toBe('http://ex.org/#def');
      });

      it('to throw when @vocab is "../#" string and @base exists if allowVocabRelativeToBase is false', async () => {
        const context = new JsonLdContextNormalized({'@vocab': '../#', '@base': 'http://ex.org/abc/'});
        const opts = {
          ...defaultExpandOptions,
          allowVocabRelativeToBase: false,
        };
        expect(() => context.expandTerm('def', true, opts)).toThrow(new ErrorCoded(
          'Relative vocab expansion for term \'def\' with vocab \'../#\' is not allowed.',
          ERROR_CODES.INVALID_VOCAB_MAPPING));
      });

      it('to return when @vocab is absolute and @base exists if allowVocabRelativeToBase is true', async () => {
        const context = new JsonLdContextNormalized({'@vocab': 'http://abc.org/', '@base': 'http://ex.org/abc/'});
        const opts = {
          ...defaultExpandOptions,
          allowVocabRelativeToBase: true,
        };
        expect(context.expandTerm('def', true, opts)).toBe('http://abc.org/def');
      });

      it('to return when @vocab is absolute string and @base exists if allowVocabRelativeToBase is false', async () => {
        const context = new JsonLdContextNormalized({'@vocab': 'http://abc.org/', '@base': 'http://ex.org/abc/'});
        const opts = {
          ...defaultExpandOptions,
          allowVocabRelativeToBase: false,
        };
        expect(context.expandTerm('def', true, opts)).toBe('http://abc.org/def');
      });

      describe('prefix handling', () => {
        describe('for allowPrefixForcing true', () => {
          describe('for allowPrefixNonGenDelims false', () => {
            const opts = {
              ...defaultExpandOptions,
              allowPrefixForcing: true,
              allowPrefixNonGenDelims: false,
            };

            describe('for simple term definitions', () => {
              it('not to expand with non-gen-delim without @prefix', async () => {
                const context = new JsonLdContextNormalized({ abc: 'http://ex.org/compact-' });
                expect(context.expandTerm('abc:def', true, opts)).toBe('abc:def');
              });

              it('to expand with gen-delim without @prefix', async () => {
                const context = new JsonLdContextNormalized({ abc: 'http://ex.org/compact/' });
                expect(context.expandTerm('abc:def', true, opts))
                  .toBe('http://ex.org/compact/def');
              });

              it('to expand for a blank node', async () => {
                const context = new JsonLdContextNormalized({ abc: '_:b' });
                expect(context.expandTerm('abc:def', true, opts)).toBe('_:bdef');
              });
            });

            describe('for expanded term definitions', () => {
              it('not to expand with non-gen-delim without @prefix', async () => {
                const context = new JsonLdContextNormalized({ abc: { '@id': 'http://ex.org/compact-' } });
                expect(context.expandTerm('abc:def', true, opts)).toBe('abc:def');
              });

              it('not to expand with non-gen-delim with @prefix false', async () => {
                const context = new JsonLdContextNormalized({
                  abc: { '@id': 'http://ex.org/compact-', '@prefix': false },
                });
                expect(context.expandTerm('abc:def', true, opts)).toBe('abc:def');
              });

              it('to expand with non-gen-delim with @prefix true', async () => {
                const context = new JsonLdContextNormalized({
                  abc: { '@id': 'http://ex.org/compact-', '@prefix': true },
                });
                expect(context.expandTerm('abc:def', true, opts))
                  .toBe('http://ex.org/compact-def');
              });

              it('not to expand with gen-delim without @prefix', async () => {
                const context = new JsonLdContextNormalized({ abc: { '@id': 'http://ex.org/compact/' } });
                expect(context.expandTerm('abc:def', true, opts))
                  .toBe('abc:def');
              });

              it('not to expand with gen-delim with @prefix false', async () => {
                const context = new JsonLdContextNormalized({
                  abc: { '@id': 'http://ex.org/compact/', '@prefix': false },
                });
                expect(context.expandTerm('abc:def',
                  true, opts)).toBe('abc:def');
              });

              it('to expand with gen-delim with @prefix true', async () => {
                const context = new JsonLdContextNormalized({
                  abc: { '@id': 'http://ex.org/compact/', '@prefix': true },
                });
                expect(context.expandTerm('abc:def', true, opts))
                  .toBe('http://ex.org/compact/def');
              });

              it('to expand for a blank node', async () => {
                const context = new JsonLdContextNormalized({ abc: { '@id': '_:b' } });
                expect(context.expandTerm('abc:def', true, opts))
                  .toBe('_:bdef');
              });

              it('to expand with gen-delim without @prefix but with a dedicated term entry', async () => {
                const context = new JsonLdContextNormalized({
                  'abc': { '@id': 'http://ex.org/compact/' },
                  'abc:def': {},
                });
                expect(context.expandTerm('abc:def', true, opts))
                  .toBe('http://ex.org/compact/def');
              });
            });
          });

          describe('for allowPrefixNonGenDelims true', () => {
            const opts = {
              ...defaultExpandOptions,
              allowPrefixForcing: true,
              allowPrefixNonGenDelims: true,
            };

            describe('for simple term definitions', () => {
              it('to expand with non-gen-delim without @prefix', async () => {
                const context = new JsonLdContextNormalized({ abc: 'http://ex.org/compact-' });
                expect(context.expandTerm('abc:def', true, opts))
                  .toBe('http://ex.org/compact-def');
              });

              it('to expand with gen-delim without @prefix', async () => {
                const context = new JsonLdContextNormalized({ abc: 'http://ex.org/compact/' });
                expect(context.expandTerm('abc:def', true, opts))
                  .toBe('http://ex.org/compact/def');
              });

              it('to expand for a blank node', async () => {
                const context = new JsonLdContextNormalized({ abc: '_:b' });
                expect(context.expandTerm('abc:def', true, opts))
                  .toBe('_:bdef');
              });
            });

            describe('for expanded term definitions', () => {
              it('not to expand with non-gen-delim without @prefix', async () => {
                const context = new JsonLdContextNormalized({ abc: { '@id': 'http://ex.org/compact-' } });
                expect(context.expandTerm('abc:def', true, opts))
                  .toBe('abc:def');
              });

              it('not to expand with non-gen-delim with @prefix false', async () => {
                const context = new JsonLdContextNormalized({
                  abc: { '@id': 'http://ex.org/compact-', '@prefix': false },
                });
                expect(context.expandTerm('abc:def', true, opts))
                  .toBe('abc:def');
              });

              it('to expand with non-gen-delim with @prefix true', async () => {
                const context = new JsonLdContextNormalized({
                  abc: { '@id': 'http://ex.org/compact-', '@prefix': true },
                });
                expect(context.expandTerm('abc:def', true, opts))
                  .toBe('http://ex.org/compact-def');
              });

              it('not to expand with gen-delim without @prefix', async () => {
                const context = new JsonLdContextNormalized({
                  abc: { '@id': 'http://ex.org/compact/' },
                });
                expect(context.expandTerm('abc:def', true, opts))
                  .toBe('abc:def');
              });

              it('not to expand with gen-delim with @prefix false', async () => {
                const context = new JsonLdContextNormalized({
                  abc: { '@id': 'http://ex.org/compact/', '@prefix': false },
                });
                expect(context.expandTerm('abc:def', true, opts))
                  .toBe('abc:def');
              });

              it('to expand with gen-delim with @prefix true', async () => {
                const context = new JsonLdContextNormalized({
                  abc: { '@id': 'http://ex.org/compact/', '@prefix': true },
                });
                expect(context.expandTerm('abc:def', true, opts))
                  .toBe('http://ex.org/compact/def');
              });

              it('to expand for a blank node', async () => {
                const context = new JsonLdContextNormalized({ abc: { '@id': '_:b' } });
                expect(context.expandTerm('abc:def', true, opts))
                  .toBe('_:bdef');
              });

              it('to expand with gen-delim without @prefix but with a dedicated term entry', async () => {
                const context = new JsonLdContextNormalized({
                  'abc': { '@id': 'http://ex.org/compact/' },
                  'abc:def': {},
                });
                expect(context.expandTerm('abc:def', true, opts))
                  .toBe('http://ex.org/compact/def');
              });
            });
          });
        });

        describe('for allowPrefixForcing false', () => {
          describe('for allowPrefixNonGenDelims false', () => {
            const opts = {
              ...defaultExpandOptions,
              allowPrefixForcing: false,
              allowPrefixNonGenDelims: false,
            };

            describe('for simple term definitions', () => {
              it('not to expand with non-gen-delim without @prefix', async () => {
                const context = new JsonLdContextNormalized({ abc: 'http://ex.org/compact-' });
                expect(context.expandTerm('abc:def', true, opts))
                  .toBe('abc:def');
              });

              it('to expand with gen-delim without @prefix', async () => {
                const context = new JsonLdContextNormalized({ abc: 'http://ex.org/compact/' });
                expect(context.expandTerm('abc:def', true, opts))
                  .toBe('http://ex.org/compact/def');
              });

              it('to expand for a blank node', async () => {
                const context = new JsonLdContextNormalized({ abc: '_:b' });
                expect(context.expandTerm('abc:def', true, opts))
                  .toBe('_:bdef');
              });
            });

            describe('for expanded term definitions', () => {
              it('not to expand with non-gen-delim without @prefix', async () => {
                const context = new JsonLdContextNormalized({ abc: { '@id': 'http://ex.org/compact-' } });
                expect(context.expandTerm('abc:def', true, opts))
                  .toBe('abc:def');
              });

              it('not to expand with non-gen-delim with @prefix false', async () => {
                const context = new JsonLdContextNormalized({
                  abc: { '@id': 'http://ex.org/compact-', '@prefix': false },
                });
                expect(context.expandTerm('abc:def', true, opts))
                  .toBe('abc:def');
              });

              it('not to expand with non-gen-delim with @prefix true', async () => {
                const context = new JsonLdContextNormalized({
                  abc: { '@id': 'http://ex.org/compact-', '@prefix': true },
                });
                expect(context.expandTerm('abc:def', true, opts))
                  .toBe('abc:def');
              });

              it('to expand with gen-delim without @prefix', async () => {
                const context = new JsonLdContextNormalized({ abc: { '@id': 'http://ex.org/compact/' } });
                expect(context.expandTerm('abc:def', true, opts))
                  .toBe('http://ex.org/compact/def');
              });

              it('to expand with gen-delim with @prefix false', async () => {
                const context = new JsonLdContextNormalized({
                  abc: { '@id': 'http://ex.org/compact/', '@prefix': false },
                });
                expect(context.expandTerm('abc:def', true, opts))
                  .toBe('http://ex.org/compact/def');
              });

              it('to expand with gen-delim with @prefix true', async () => {
                const context = new JsonLdContextNormalized({
                  abc: { '@id': 'http://ex.org/compact/', '@prefix': true },
                });
                expect(context.expandTerm('abc:def', true, opts))
                  .toBe('http://ex.org/compact/def');
              });

              it('to expand for a blank node', async () => {
                const context = new JsonLdContextNormalized({ abc: { '@id': '_:b' } });
                expect(context.expandTerm('abc:def', true, opts))
                  .toBe('_:bdef');
              });

              it('to expand with gen-delim without @prefix but with a dedicated term entry', async () => {
                const context = new JsonLdContextNormalized({
                  'abc': { '@id': 'http://ex.org/compact/' },
                  'abc:def': {},
                });
                expect(context.expandTerm('abc:def', true, opts))
                  .toBe('http://ex.org/compact/def');
              });
            });
          });

          describe('for allowPrefixNonGenDelims true', () => {
            const opts = {
              ...defaultExpandOptions,
              allowPrefixForcing: false,
              allowPrefixNonGenDelims: true,
            };

            describe('for simple term definitions', () => {
              it('to expand with non-gen-delim without @prefix', async () => {
                const context = new JsonLdContextNormalized({ abc: 'http://ex.org/compact-' });
                expect(context.expandTerm('abc:def', true, opts))
                  .toBe('http://ex.org/compact-def');
              });

              it('to expand with gen-delim without @prefix', async () => {
                const context = new JsonLdContextNormalized({ abc: 'http://ex.org/compact/' });
                expect(context.expandTerm('abc:def', true, opts))
                  .toBe('http://ex.org/compact/def');
              });

              it('to expand for a blank node', async () => {
                const context = new JsonLdContextNormalized({ abc: '_:b' });
                expect(context.expandTerm('abc:def', true, opts))
                  .toBe('_:bdef');
              });
            });

            describe('for expanded term definitions', () => {
              it('to expand with non-gen-delim without @prefix', async () => {
                const context = new JsonLdContextNormalized({ abc: { '@id': 'http://ex.org/compact-' } });
                expect(context.expandTerm('abc:def', true, opts))
                  .toBe('http://ex.org/compact-def');
              });

              it('to expand with non-gen-delim with @prefix false', async () => {
                const context = new JsonLdContextNormalized({
                  abc: { '@id': 'http://ex.org/compact-', '@prefix': false },
                });
                expect(context.expandTerm('abc:def', true, opts))
                  .toBe('http://ex.org/compact-def');
              });

              it('to expand with non-gen-delim with @prefix true', async () => {
                const context = new JsonLdContextNormalized({
                  abc: { '@id': 'http://ex.org/compact-', '@prefix': true },
                });
                expect(context.expandTerm('abc:def', true, opts))
                  .toBe('http://ex.org/compact-def');
              });

              it('to expand with gen-delim without @prefix', async () => {
                const context = new JsonLdContextNormalized({ abc: { '@id': 'http://ex.org/compact/' } });
                expect(context.expandTerm('abc:def', true, opts))
                  .toBe('http://ex.org/compact/def');
              });

              it('to expand with gen-delim with @prefix false', async () => {
                const context = new JsonLdContextNormalized({
                  abc: { '@id': 'http://ex.org/compact/', '@prefix': false },
                });
                expect(context.expandTerm('abc:def', true, opts))
                  .toBe('http://ex.org/compact/def');
              });

              it('to expand with gen-delim with @prefix true', async () => {
                const context = new JsonLdContextNormalized({
                  abc: { '@id': 'http://ex.org/compact/', '@prefix': true },
                });
                expect(context.expandTerm('abc:def', true, opts))
                  .toBe('http://ex.org/compact/def');
              });

              it('to expand for a blank node', async () => {
                const context = new JsonLdContextNormalized({ abc: { '@id': '_:b' } });
                expect(context.expandTerm('abc:def', true, opts))
                  .toBe('_:bdef');
              });

              it('to expand with gen-delim without @prefix but with a dedicated term entry', async () => {
                const context = new JsonLdContextNormalized({
                  'abc': { '@id': 'http://ex.org/compact/' },
                  'abc:def': {},
                });
                expect(context.expandTerm('abc:def', true, opts))
                  .toBe('http://ex.org/compact/def');
              });
            });
          });
        });
      });

      it('to throw when context alias value is not a string', async () => {
        const context = new JsonLdContextNormalized({ k: { '@id': 3 } });
        expect(() => context.expandTerm('k', true))
          .toThrow(new ErrorCoded('Invalid IRI mapping found for context entry \'k\': \'{"@id":3}\'',
            ERROR_CODES.INVALID_IRI_MAPPING));
      });

      it('to throw when context alias value is not an IRI', async () => {
        const context = new JsonLdContextNormalized({ k: { '@id': 'not an IRI' } });
        expect(() => context.expandTerm('k', true))
          .toThrow(new ErrorCoded('Invalid IRI mapping found for context entry \'k\': \'{"@id":"not an IRI"}\'',
            ERROR_CODES.INVALID_IRI_MAPPING));
      });

      it('to ignore invalid aliases and fallback to vocab', async () => {
        const context = new JsonLdContextNormalized({
          "@vocab": "http://example.org/",
          "ignoreMe": "@ignoreMe",
        });
        expect(context.expandTerm('ignoreMe', true)).toBe('http://example.org/ignoreMe');
      });

      it('to ignore invalid keyword-like alias without vocab', async () => {
        const context = new JsonLdContextNormalized({ ignoreMe: "@ignoreMe" });
        expect(context.expandTerm('ignoreMe', true))
          .toBe('ignoreMe');
      });

      it('to ignore invalid keyword-like alias with @reverse', async () => {
        const context = new JsonLdContextNormalized({ ignoreMe: { "@id": "@ignoreMe", "@reverse": true } });
        expect(context.expandTerm('ignoreMe', true))
          .toBe('ignoreMe');
      });

      it('to handle invalid keyword-like alias with @reverse and @vocab', async () => {
        const context = new JsonLdContextNormalized({
          "@vocab": "http://example.org/",
          "ignoreMe": { "@id": "@ignoreMe", "@reverse": true },
        });
        expect(context.expandTerm('ignoreMe', true))
          .toBe('http://example.org/ignoreMe');
      });

      it('to return on a term starting with a colon with @vocab', async () => {
        const context = new JsonLdContextNormalized({':b': {'@type': '@id'}, '@vocab': 'http://ex.org/'});
        expect(context.expandTerm(':b',
          true)).toBe('http://ex.org/:b');
      });

      it('to return on a term starting with a colon without @vocab', async () => {
        const context = new JsonLdContextNormalized({':b': {'@type': '@id'}});
        expect(context.expandTerm(':b', true)).toBe(':b');
      });
    });

    describe('in base-mode', () => {
      it('to return when no prefix applies', async () => {
        const context = new JsonLdContextNormalized({def: 'DEF/'});
        expect(context.expandTerm('abc:123', false)).toBe('abc:123');
      });

      it('to return when no prefix applies with @id', async () => {
        const context = new JsonLdContextNormalized({def: {}});
        expect(context.expandTerm('def:123', false)).toBe('def:123');
      });

      it('to return when no term applies with @id', async () => {
        const context = new JsonLdContextNormalized({def: {}});
        expect(context.expandTerm('def', false)).toBe('def');
      });

      it('to return when a prefix applies', async () => {
        const context = new JsonLdContextNormalized({def: 'DEF/'});
        expect(context.expandTerm('def:123', false)).toBe('DEF/123');
      });

      it('to return when a prefix applies with @id', async () => {
        const context = new JsonLdContextNormalized({def: { '@id': 'DEF/'} });
        expect(context.expandTerm('def:123', false)).toBe('def:123');
      });

      it('to return when it is a prefix with colon', async () => {
        const context = new JsonLdContextNormalized({def: 'DEF/'});
        expect(context.expandTerm('def:', false)).toBe('DEF/');
      });

      it('to return when a direct value applies, but ignore it in base-mode', async () => {
        const context = new JsonLdContextNormalized({abc: 'DEF'});
        expect(context.expandTerm('abc', false)).toBe('abc');
      });

      it('to return when @vocab exists but not applies', async () => {
        const context = new JsonLdContextNormalized({'@vocab': 'bbb/'});
        expect(context.expandTerm('def:123', false)).toBe('def:123');
      });

      it('to return when @vocab exists and applies', async () => {
        const context = new JsonLdContextNormalized({'@vocab': 'bbb/'});
        expect(context.expandTerm('def', false)).toBe('def');
      });

      it('to return when @vocab exists and applies, but is disabled', async () => {
        const context = new JsonLdContextNormalized({'@vocab': 'bbb/', 'def': null});
        expect(context.expandTerm('def', false)).toBe(null);
      });

      it('to return when @vocab exists and applies, but is disabled via @id', async () => {
        const context = new JsonLdContextNormalized({'@vocab': 'bbb/', 'def': { '@id': null }});
        expect(context.expandTerm('def', false)).toBe(null);
      });

      it('to return when @base exists but not applies', async () => {
        const context = new JsonLdContextNormalized({'@base': 'bbb/'});
        expect(context.expandTerm('def:123', false)).toBe('def:123');
      });

      it('to return when @base exists and applies', async () => {
        const context = new JsonLdContextNormalized({'@base': 'http://bbb/'});
        expect(context.expandTerm('def', false))
          .toBe('http://bbb/def');
      });

      it('to return when @base exists and applies, but is disabled', async () => {
        const context = new JsonLdContextNormalized({'@base': 'bbb/', 'def': null});
        expect(context.expandTerm('def', false)).toBe(null);
      });

      it('to return when @base exists and applies, but is disabled via @id', async () => {
        const context = new JsonLdContextNormalized({'@base': 'bbb/', 'def': { '@id': null }});
        expect(context.expandTerm('def', false)).toBe(null);
      });

      it('to return when @base exists and applies, and a relative hash with a semicolon', async () => {
        const context = new JsonLdContextNormalized({'@base': 'http://ex.org/'});
        expect(context.expandTerm('#abc:def', false))
          .toBe('http://ex.org/#abc:def');
      });

      it('to return when @vocab is empty string and @base does not exist', async () => {
        const context = new JsonLdContextNormalized({'@vocab': ''});
        expect(context.expandTerm('def', false)).toBe('def');
      });

      it('to return when @vocab is empty string and @base exists', async () => {
        const context = new JsonLdContextNormalized({'@vocab': '', '@base': 'http://ex.org/'});
        expect(context.expandTerm('def', false))
          .toBe('http://ex.org/def');
      });

      it('to return when a term and prefix applies', async () => {
        const context = new JsonLdContextNormalized({
          bla: 'DEF/123',
          def: 'DEF/',
        });
        expect(context.expandTerm('bla', false)).toBe('bla');
      });

      it('to return when a prefix and prefix applies', async () => {
        const context = new JsonLdContextNormalized({
          a: 'DEF/A/',
          def: 'DEF/',
        });
        expect(context.expandTerm('a:123', false)).toBe('DEF/A/123');
      });

      it('to return identity when context alias value is not a string', async () => {
        const context = new JsonLdContextNormalized({ k: { '@id': 3 } });
        expect(context.expandTerm('k', false)).toBe('k');
      });

      it('to return identity when context alias value is not an IRI', async () => {
        const context = new JsonLdContextNormalized({ k: { '@id': 'not an IRI' } });
        expect(context.expandTerm('k', false)).toBe('k');
      });
    });
  });

  describe('#compactIri', () => {
    describe('in vocab-mode', () => {
      it('when no prefix applies in an empty context', async () => {
        const context = new JsonLdContextNormalized({});
        expect(context.compactIri('http://ex.org/abc', true)).toBe('http://ex.org/abc');
      });

      it('when no prefix applies', async () => {
        const context = new JsonLdContextNormalized({
          myterm: 'http://ex2.org/abc',
        });
        expect(context.compactIri('http://ex.org/abc', true)).toBe('http://ex.org/abc');
      });

      it('when @vocab applies', async () => {
        const context = new JsonLdContextNormalized({
          '@vocab': 'http://ex.org/',
        });
        expect(context.compactIri('http://ex.org/abc', true)).toBe('abc');
      });

      it('when @base applies', async () => {
        const context = new JsonLdContextNormalized({
          '@base': 'http://ex.org/',
        });
        expect(context.compactIri('http://ex.org/abc', true)).toBe('http://ex.org/abc');
      });

      it('when a term alias applies', async () => {
        const context = new JsonLdContextNormalized({
          myterm: 'http://ex.org/abc',
        });
        expect(context.compactIri('http://ex.org/abc', true)).toBe('myterm');
      });

      it('when a term prefix applies', async () => {
        const context = new JsonLdContextNormalized({
          ex: 'http://ex.org/',
        });
        expect(context.compactIri('http://ex.org/abc', true)).toBe('ex:abc');
      });

      it('when a term prefix and term alias applies', async () => {
        const context = new JsonLdContextNormalized({
          ex: 'http://ex.org/',
          thing: 'http://ex.org/abc',
        });
        expect(context.compactIri('http://ex.org/abc', true)).toBe('thing');
      });

      it('when multiple prefixes apply', async () => {
        const context = new JsonLdContextNormalized({
          a: 'http://ex.org/a/',
          b: 'http://ex.org/a/b/',
          c: 'http://ex.org/a/b/c/',
        });
        expect(context.compactIri('http://ex.org/a/b/c/suffix', true)).toBe('c:suffix');
      });

      it('when multiple prefixes apply in different order', async () => {
        const context = new JsonLdContextNormalized({
          0: 'http://ex.org/a/b/c/',
          1: 'http://ex.org/a/b/',
          2: 'http://ex.org/a/',
        });
        expect(context.compactIri('http://ex.org/a/b/c/suffix', true)).toBe('0:suffix');
      });
    });

    describe('in base-mode', () => {
      it('when no prefix applies', async () => {
        const context = new JsonLdContextNormalized({});
        expect(context.compactIri('http://ex.org/abc', false)).toBe('http://ex.org/abc');
      });

      it('when @vocab applies', async () => {
        const context = new JsonLdContextNormalized({
          '@vocab': 'http://ex.org/',
        });
        expect(context.compactIri('http://ex.org/abc', false)).toBe('http://ex.org/abc');
      });

      it('when @base applies', async () => {
        const context = new JsonLdContextNormalized({
          '@base': 'http://ex.org/',
        });
        expect(context.compactIri('http://ex.org/abc', false)).toBe('abc');
      });

      it('when a term alias applies', async () => {
        const context = new JsonLdContextNormalized({
          myterm: 'http://ex.org/abc',
        });
        expect(context.compactIri('http://ex.org/abc', false)).toBe('http://ex.org/abc');
      });

      it('when a term prefix applies', async () => {
        const context = new JsonLdContextNormalized({
          ex: 'http://ex.org/',
        });
        expect(context.compactIri('http://ex.org/abc', false)).toBe('ex:abc');
      });

      it('when a term prefix and term alias applies', async () => {
        const context = new JsonLdContextNormalized({
          ex: 'http://ex.org/',
          thing: 'http://ex.org/abc',
        });
        expect(context.compactIri('http://ex.org/abc', false)).toBe('ex:abc');
      });
    });
  });
});
