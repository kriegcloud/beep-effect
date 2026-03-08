import { LexerBuilder, createToken } from '@traqula/core';

export const LCurly = createToken({ name: 'LCurly', pattern: '{', label: '{' });
export const RCurly = createToken({ name: 'RCurly', pattern: '}', label: '}' });
export const dot = createToken({ name: 'Dot', pattern: '.', label: '.' });
export const comma = createToken({ name: 'Comma', pattern: ',', label: ',' });
export const semi = createToken({ name: 'Semi', pattern: ';', label: ';' });
export const LParen = createToken({ name: 'LParen', pattern: '(', label: '(' });
export const RParen = createToken({ name: 'RParen', pattern: ')', label: ')' });
export const LSquare = createToken({ name: 'LSquare', pattern: '[', label: '[' });
export const RSquare = createToken({ name: 'RSquare', pattern: ']', label: ']' });
export const pipe = createToken({ name: 'Pipe', pattern: '|', label: '|' });
export const slash = createToken({ name: 'Slash', pattern: '/', label: '/' });
export const hat = createToken({ name: 'Hat', pattern: '^', label: '^' });
export const question = createToken({ name: 'Question', pattern: '?', label: '?' });
export const star = createToken({ name: 'Star', pattern: '*', label: '*' });
export const opPlus = createToken({ name: 'OpPlus', pattern: '+', label: '+' });
export const opMinus = createToken({ name: 'OpMinus', pattern: '-', label: '-' });
export const exclamation = createToken({ name: 'Exclamation', pattern: '!', label: '!' });
export const logicAnd = createToken({ name: 'LogicAnd', pattern: '&&', label: '&&' });
export const logicOr = createToken({ name: 'LogicOr', pattern: '||', label: '||' });
export const equal = createToken({ name: 'Equal', pattern: '=', label: '=' });
export const notEqual = createToken({ name: 'NotEqual', pattern: '!=', label: '!=' });
export const lessThan = createToken({ name: 'LessThan', pattern: '<', label: '<' });
export const greaterThan = createToken({ name: 'GreaterThan', pattern: '>', label: '>' });
export const lessThanEqual = createToken({ name: 'LessThanEqual', pattern: '<=', label: '<=' });
export const greaterThanEqual = createToken({ name: 'GreaterThanEqual', pattern: '>=', label: '>=' });
export const hathat = createToken({ name: 'Hathat', pattern: '^^', label: '^^' });

export const allSymbols = LexerBuilder.create().add(
  logicAnd,
  logicOr,
  notEqual,
  lessThanEqual,
  greaterThanEqual,
  LCurly,
  RCurly,
  dot,
  comma,
  semi,
  LParen,
  RParen,
  LSquare,
  RSquare,
  pipe,
  slash,
  hathat,
  hat,
  question,
  star,
  opPlus,
  opMinus,
  exclamation,
  equal,
  lessThan,
  greaterThan,
);
