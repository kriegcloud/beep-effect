import { Lexer } from '@traqula/chevrotain';
import { LexerBuilder, createToken } from '@traqula/core';
import {
  anonPattern,
  blankNodeLabelPattern,
  commentPattern,
  decimalNegativePattern,
  decimalPattern,
  decimalPositivePattern,
  doubleNegativePattern,
  doublePattern,
  doublePositivePattern,
  integerNegativePattern,
  integerPattern,
  integerPositivePattern,
  iriRefPattern,
  langTagPattern,
  nilPattern,
  pNameLnPattern,
  pNameNsPattern,
  stringLiteral1Pattern,
  stringLiteral2Pattern,
  stringLiteralLong1Pattern,
  stringLiteralLong2Pattern,
  var1Pattern,
  var2Pattern,
  wsPattern,
} from './lexerPatterns.js';

/**
 * [[139]](https://www.w3.org/TR/sparql11-query/#rIRIREF)
 */
export const iriRef = createToken({ name: 'IriRef', pattern: iriRefPattern });
/**
 * [[141]](https://www.w3.org/TR/sparql11-query/#rPNAME_LN)
 */
export const pNameLn = createToken({ name: 'PNameLn', pattern: pNameLnPattern });
/**
 * [[140]](https://www.w3.org/TR/sparql11-query/#rPNAME_NS)
 */
export const pNameNs = createToken({ name: 'PNameNs', pattern: pNameNsPattern, longer_alt: [ pNameLn ]});
/**
 * [[142]](https://www.w3.org/TR/sparql11-query/#rBLANK_NODE_LABEL)
 */
export const blankNodeLabel = createToken({ name: 'BlankNodeLabel', pattern: blankNodeLabelPattern });
/**
 * [[143]](https://www.w3.org/TR/sparql11-query/#rVAR1)
 */
export const var1 = createToken({ name: 'Var1', pattern: var1Pattern });
/**
 * [[144]](https://www.w3.org/TR/sparql11-query/#rVAR1)
 */
export const var2 = createToken({ name: 'Var2', pattern: var2Pattern });
/**
 * [[145]](https://www.w3.org/TR/sparql11-query/#rLANGTAG)
 */
export const langTag = createToken({ name: 'LangTag', pattern: langTagPattern });
/**
 * [[146]](https://www.w3.org/TR/sparql11-query/#rINTEGER)
 */
export const integer = createToken({ name: 'Integer', pattern: integerPattern });
/**
 * [[148]](https://www.w3.org/TR/sparql11-query/#rDOUBLE)
 */
export const decimal = createToken({ name: 'Decimal', pattern: decimalPattern });
/**
 * [[148]](https://www.w3.org/TR/sparql11-query/#rDOUBLE)
 */
export const double = createToken({ name: 'Double', pattern: doublePattern });
/**
 * [[149]](https://www.w3.org/TR/sparql11-query/#rINTEGER_POSITIVE)
 */
export const integerPositive = createToken({ name: 'IntegerPositive', pattern: integerPositivePattern });
/**
 * [[150]](https://www.w3.org/TR/sparql11-query/#rDECIMAL_POSITIVE)
 */
export const decimalPositive = createToken({ name: 'DecimalPositive', pattern: decimalPositivePattern });
/**
 * [[151]](https://www.w3.org/TR/sparql11-query/#rDOUBLE_POSITIVE)
 */
export const doublePositive = createToken({ name: 'DoublePositive', pattern: doublePositivePattern });
/**
 * [[152]](https://www.w3.org/TR/sparql11-query/#rINTEGER_NEGATIVE)
 */
export const integerNegative = createToken({ name: 'IntegerNegative', pattern: integerNegativePattern });
/**
 * [[153]](https://www.w3.org/TR/sparql11-query/#rDECIMAL_NEGATIVE)
 */
export const decimalNegative = createToken({ name: 'DecimalNegative', pattern: decimalNegativePattern });
/**
 * [[154]](https://www.w3.org/TR/sparql11-query/#rDOUBLE_NEGATIVE)
 */
export const doubleNegative = createToken({ name: 'DoubleNegative', pattern: doubleNegativePattern });
/**
 * [[156]](https://www.w3.org/TR/sparql11-query/#rSTRING_LITERAL1)
 */
export const stringLiteral1 = createToken({ name: 'StringLiteral1', pattern: stringLiteral1Pattern });
/**
 * [[157]](https://www.w3.org/TR/sparql11-query/#rSTRING_LITERAL1)
 */
export const stringLiteral2 = createToken({ name: 'StringLiteral2', pattern: stringLiteral2Pattern });
/**
 * [[158]](https://www.w3.org/TR/sparql11-query/#rSTRING_LITERAL_LONG1)
 */
export const stringLiteralLong1 = createToken({ name: 'StringLiteralLong1', pattern: stringLiteralLong1Pattern });
/**
 * [[159]]https://www.w3.org/TR/sparql11-query/#rSTRING_LITERAL_LONG2)
 */
export const stringLiteralLong2 = createToken({ name: 'StringLiteralLong2', pattern: stringLiteralLong2Pattern });
/**
 * https://www.w3.org/TR/sparql11-query/#rWS
 */
export const ws = createToken({ name: 'Ws', pattern: wsPattern, group: Lexer.SKIPPED });
export const comment = createToken({ name: 'Comment', pattern: commentPattern, group: Lexer.SKIPPED });
/**
 * [[161]](https://www.w3.org/TR/sparql11-query/#rNIL)
 */
export const nil = createToken({ name: 'Nil', pattern: nilPattern });
/**
 * [[163]](https://www.w3.org/TR/sparql11-query/#rANON)
 */
export const anon = createToken({ name: 'Anon', pattern: anonPattern });

export const allTerminals = LexerBuilder.create().add(
  iriRef,
  pNameNs,
  pNameLn,
  blankNodeLabel,
  var1,
  var2,
  langTag,
  double,
  decimal,
  integer,
  doublePositive,
  decimalPositive,
  integerPositive,
  doubleNegative,
  decimalNegative,
  integerNegative,
  stringLiteralLong1,
  stringLiteralLong2,
  stringLiteral1,
  stringLiteral2,
  ws,
  comment,
  nil,
  anon,
);
