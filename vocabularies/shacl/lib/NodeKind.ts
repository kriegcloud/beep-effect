import { sh } from './namespace.js';

const values = {
  BlankNode: sh.BlankNode,
  BlankNodeOrIRI: sh.BlankNodeOrIRI,
  BlankNodeOrLiteral: sh.BlankNodeOrLiteral,
  IRI: sh.IRI,
  IRIOrLiteral: sh.IRIOrLiteral,
  Literal: sh.Literal,
};

export type NodeKind = typeof values[keyof typeof values];

export default values;
