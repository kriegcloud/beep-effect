/* eslint-disable require-unicode-regexp */
import { LexerBuilder, createToken } from '@traqula/core';
import { lex as l11 } from '@traqula/rules-sparql-1-1';

export const version = createToken({ name: 'Version', pattern: /version/i, label: 'version identifier' });
export const tilde = createToken({ name: 'Tilde', pattern: '~', label: '~' });
export const annotationOpen = createToken({ name: 'AnnotationOpen', pattern: '{|', label: `Annotation Open: {|` });
export const annotationClose = createToken({ name: 'AnnotationClose', pattern: '|}', label: 'Annotation Close |}' });
export const reificationOpen = createToken({ name: 'ReificationOpen', pattern: '<<', label: 'Reification open <<' });
export const reificationClose = createToken({ name: 'ReificationClose', pattern: '>>', label: 'Reification close >>' });
export const tripleTermOpen = createToken({ name: 'TripleTermOpen', pattern: '<<(', label: 'Triple Term Open <<(' });
export const tripleTermClose = createToken({ name: 'TripleTermClose', pattern: ')>>', label: 'Triple Term Close )>>' });

export const buildInLangDir = createToken({ name: 'BuiltInLangdir', pattern: /langdir/i, label: 'LANGDIR' });
export const buildInStrLangDir = createToken({
  name: 'BuiltInStrLangdir',
  pattern: /strlangdir/i,
  label: 'STRLANGDIR',
});
export const buildInHasLang = createToken({ name: 'BuiltInHasLang', pattern: /haslang/i, label: 'hasLANG' });
export const buildInHasLangDir = createToken({
  name: 'BuiltInHasLangdir',
  pattern: /haslangdir/i,
  label: 'hasLANGDIR',
});
export const buildInIsTRIPLE = createToken({ name: 'BuiltInIsTriple', pattern: /istriple/i, label: 'isTRIPLE' });
export const buildInTRIPLE = createToken({ name: 'BuiltInTriple', pattern: /triple/i, label: 'TRIPLE' });
export const buildInSUBJECT = createToken({ name: 'BuiltInSubject', pattern: /subject/i, label: 'SUBJECT' });
export const buildInPREDICATE = createToken({ name: 'BuiltInPredicate', pattern: /predicate/i, label: 'PREDICATE' });
export const buildInOBJECT = createToken({ name: 'BuiltInObject', pattern: /object/i, label: 'OBJECT' });

export const LANG_DIR = createToken({
  name: 'LANG_DIR',
  pattern: /@[a-z]+(?:-[\da-z]+)*(?:--[a-z]+)?/i,
  label: 'LANG_DIR',
});

export const sparql12LexerBuilder = LexerBuilder
  .create(l11.sparql11LexerBuilder)
  .addBefore(
    l11.symbols.logicAnd,
    tilde,
    annotationOpen,
    annotationClose,
    tripleTermOpen,
    tripleTermClose,
    reificationOpen,
    reificationClose,
    version,
  )
  .addBefore(
    l11.builtIn.langmatches,
    buildInLangDir,
    buildInStrLangDir,
    buildInHasLangDir,
    buildInHasLang,
    buildInIsTRIPLE,
    buildInTRIPLE,
    buildInSUBJECT,
    buildInPREDICATE,
    buildInOBJECT,
  )
  .addBefore(l11.terminals.langTag, LANG_DIR)
  .delete(l11.terminals.langTag);
