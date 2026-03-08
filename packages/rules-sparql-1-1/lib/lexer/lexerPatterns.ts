/* eslint-disable require-unicode-regexp,no-misleading-character-class,max-len,no-control-regex */

export const pnCharsBasePattern = /[A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF]/;
export const pnCharsUPattern = new RegExp(`${pnCharsBasePattern.source}|_`);
export const varNamePattern = new RegExp(`((${pnCharsUPattern.source})|[0-9])((${pnCharsUPattern.source})|[0-9]|[\u00B7\u0300-\u036F\u203F-\u2040])*`);
export const iriRefPattern = /<([^\u0000-\u0020"<>\\^`{|}])*>/;
export const pnCharsPattern = new RegExp(`(${pnCharsUPattern.source})|[\\-0-9\u00B7\u0300-\u036F\u203F-\u2040]`);
export const pnPrefixPattern = new RegExp(`(${pnCharsBasePattern.source})(((${pnCharsPattern.source})|\\.)*(${pnCharsPattern.source}))?`);
export const pNameNsPattern = new RegExp(`(${pnPrefixPattern.source})?:`);
export const percentPattern = /%[\dA-Fa-f]{2}/;
export const pnLocalEscPattern = /\\[!#$%&'()*+,./;=?@\\_~-]/;
export const plxPattern = new RegExp(`(${percentPattern.source})|(${pnLocalEscPattern.source})`);
export const pnLocalPattern = new RegExp(`((${pnCharsUPattern.source})|:|[0-9]|(${plxPattern.source}))(((${pnCharsPattern.source})|\\.|:|(${plxPattern.source}))*((${pnCharsPattern.source})|:|(${plxPattern.source})))?`);
export const pNameLnPattern = new RegExp(`(${pNameNsPattern.source})(${pnLocalPattern.source})`);
export const blankNodeLabelPattern = new RegExp(`_:((${pnCharsUPattern.source})|[0-9])(((${pnCharsPattern.source})|\\.)*(${pnCharsPattern.source}))?`);
export const var1Pattern = new RegExp(`\\?(${varNamePattern.source})`);
export const var2Pattern = new RegExp(`\\$(${varNamePattern.source})`);
export const langTagPattern = /@[A-Za-z]+(-[\dA-Za-z]+)*/;
export const integerPattern = /\d+/;
export const decimalPattern = /\d+\.\d+/;
export const exponentPattern = /[Ee][+-]?\d+/;
export const doublePattern = new RegExp(`([0-9]+\\.[0-9]*(${exponentPattern.source}))|(\\.[0-9]+(${exponentPattern.source}))|([0-9]+(${exponentPattern.source}))`);
export const integerPositivePattern = new RegExp(`\\+${integerPattern.source}`);
export const decimalPositivePattern = new RegExp(`\\+${decimalPattern.source}`);
export const doublePositivePattern = new RegExp(`\\+${doublePattern.source}`);
export const integerNegativePattern = new RegExp(`-${integerPattern.source}`);
export const decimalNegativePattern = new RegExp(`-${decimalPattern.source}`);
export const doubleNegativePattern = new RegExp(`-${doublePattern.source}`);
export const echarPattern = /\\[\\"'bfnrt]/u;
export const stringLiteral1Pattern = new RegExp(`'(([^\\u0027\\u005C\\u000A\u000D])|(${echarPattern.source}))*'`);
export const stringLiteral2Pattern = new RegExp(`"(([^\\u0022\\u005C\\u000A\\u000D])|(${echarPattern.source}))*"`);
export const stringLiteralLong1Pattern = new RegExp(`'''(('|(''))?([^'\\\\]|(${echarPattern.source})))*'''`);
export const stringLiteralLong2Pattern = new RegExp(`"""(("|(""))?([^"\\\\]|(${echarPattern.source})))*"""`);
export const wsPattern = /[\u0009\u000A\u000D ]/;
export const nilPattern = new RegExp(`\\((${wsPattern.source})*\\)`);
export const anonPattern = new RegExp(`\\[(${wsPattern.source})*\\]`);
export const commentPattern = /#[^\n]*\n/;

export const atLeastOneBlankPattern = new RegExp(`((${wsPattern.source}+)|(${commentPattern.source}))+`);
