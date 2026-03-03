import { testFixture } from '../Fixture.js'

describe('errs with always reserved word', () => {
  testFixture({
    input: 'continue',
    extraParseArgs: {
      module: false,
      strictMode: false,
      asyncFunctionBody: false
    },
    error: 'Unexpected reserved keyword "continue"'
  })
});

describe('errs with always reserved word in union', () => {
  testFixture({
    input: 'abc | continue',
    extraParseArgs: {
      module: false,
      strictMode: false,
      asyncFunctionBody: false
    },
    error: 'Unexpected reserved keyword "continue"'
  })
});

describe('errs with always reserved word in intersection', () => {
  testFixture({
    input: 'abc & continue',
    extraParseArgs: {
      module: false,
      strictMode: false,
      asyncFunctionBody: false
    },
    errors: {
      typescript: 'Unexpected reserved keyword "continue"'
    }
  })
});

describe('errs with always reserved word in parentheses', () => {
  testFixture({
    input: '((continue))',
    extraParseArgs: {
      module: false,
      strictMode: false,
      asyncFunctionBody: false
    },
    error: 'Unexpected reserved keyword "continue"'
  })
});

describe('errs with future always reserved word', () => {
  testFixture({
    input: 'enum',
    extraParseArgs: {
      module: false,
      strictMode: false,
      asyncFunctionBody: false
    },
    error: 'Unexpected future reserved keyword "enum"'
  })
});

describe('errs with strict-mode-restricted (module) reserved word', () => {
  testFixture({
    input: 'let',
    extraParseArgs: {
      module: true,
      strictMode: false,
      asyncFunctionBody: false
    },
    error: 'Unexpected reserved keyword "let" for strict mode'
  })
});

describe('errs with strict-mode-restricted reserved word', () => {
  testFixture({
    input: 'let',
    extraParseArgs: {
      module: false,
      strictMode: true,
      asyncFunctionBody: false
    },
    error: 'Unexpected reserved keyword "let" for strict mode'
  })
});

describe('doesn\'t err with strict-mode-restricted reserved word when disabled', () => {
  testFixture({
    input: 'let',
    modes: ['typescript'],
    extraParseArgs: {
      module: false,
      strictMode: false,
      asyncFunctionBody: false
    },
    expected: {
      type: 'JsdocTypeName',
      value: 'let'
    }
  })
});

describe('doesn\'t err with always reserved word which is also a root type', () => {
  testFixture({
    input: 'void',
    modes: ['jsdoc', 'closure', 'typescript'],
    extraParseArgs: {
      module: false,
      strictMode: false,
      asyncFunctionBody: false
    },
    expected: {
      type: 'JsdocTypeName',
      value: 'void'
    }
  })
});

describe('errs with future strict-mode-restricted reserved word', () => {
  testFixture({
    input: 'implements',
    extraParseArgs: {
      module: true,
      strictMode: false,
      asyncFunctionBody: false
    },
    error: 'Unexpected future reserved keyword "implements" for strict mode'
  })
});

describe('errs with non-identifier in strict mode', () => {
  testFixture({
    input: 'arguments',
    extraParseArgs: {
      module: true,
      strictMode: false,
      asyncFunctionBody: false
    },
    error: 'The item "arguments" is not an identifier in strict mode'
  })
});

describe('errs with (module) reserved word in module/async context', () => {
  testFixture({
    input: 'await',
    extraParseArgs: {
      module: true,
      strictMode: false,
      asyncFunctionBody: false
    },
    error: 'Unexpected reserved keyword "await" for modules or async function bodies'
  })
});

describe('errs with (asyncFunctionBody) reserved word in module/async context', () => {
  testFixture({
    input: 'await',
    extraParseArgs: {
      module: false,
      strictMode: false,
      asyncFunctionBody: true
    },
    error: 'Unexpected reserved keyword "await" for modules or async function bodies'
  })
});

describe('errs with reserved word `this` outside of class context', () => {
  testFixture({
    input: 'this',
    extraParseArgs: {
      classContext: false
    },
    error: 'Unexpected reserved keyword "this"'
  })
});

describe('does not err with reserved word in class context', () => {
  testFixture({
    input: 'this',
    extraParseArgs: {
      classContext: true
    },
    modes: ['jsdoc', 'closure', 'typescript'],
    expected: {
      type: 'JsdocTypeName',
      value: 'this'
    }
  })
});
