How to add a new parse type
---------------------------

This project works best with a test-driven design. This is a write-up of the neccessary steps.

For example let's say we want to add TypeScript predicates i.e. `@returns {x is string}`. To do that it makes sense to
follow these steps:

1. Add a new result type. In this case it is a `RootResult` which means that can appear as a root node of an AST.
   It is important that we use a type that is not used yet and is prefixed with `JsdocType`. We choose `JsdocTypePredicate`.
   A predicate can have two child elements, we call them `left` and `right`. `left` always has to be a name.
   We add the following to the file `src/result/RootResult.ts`:

```typescript
export type RootResult =
  // ...
  | PredicateResult

/**
 * A TypeScript predicate. Is used in return annotations like this: `@return {x is string}`.
 */
export interface PredicateResult {
  type: 'JsdocTypePredicate'
  left: NameResult
  right: RootResult
}
```

If adding a `NonRootResult`, you will need to add an exclusion to
`assertRootResult` in `src/assertTypes.ts`.

2. Run the tests. With `npm test` we do a typecheck (`npm run typecheck`), linting (`npm run lint`) and the unit tests (`npm run test:spec`).
   If we run `npm test` we first see that there are multiple type problems in the transforms.

3. For the `catharsisTransform` and the `jtpTransform` we can simply add `notAvailableTransform` as these do not support TypeScript
   predicates (see the respective files for examples). The `identityTransform` simply needs to return the same type and the
   `stringify` transform should create a valid string output of a given type. These transforms look like this:

```typescript
// catharsis & jtp
{
  // ...
  JsdocTypePredicate: notAvailableTransform
}
// identity
{
  // ...
  JsdocTypePredicate: (result, transform) => ({
    type: 'JsdocTypePredicate',
    left: transform(result.left) as NameResult,
    right: transform(result.right) as RootResult
  })
}
// stringify
{
  // ...
  JsdocTypePredicate: (result, transform) => `${transform(result.left)} is ${transform(result.right)}`
}
```

5. Specify visitor keys. This is the next type error that will occur in file `src/visitorKeys.ts`. These are the
   properties of our new type which should be visited by tree traversing functions. In our case these are `['left', 'right']`.

6. Add a test. To test we think about an example expression and how we expect it to be parsed. Then we specify these
   in a fixture test and use `testFixture` to do this. There the typing can guide us to fill all required fields.
   Check the [API docs](https://jsdoc-type-pratt-parser.github.io/jsdoc-type-pratt-parser/docs/interfaces/Fixture.html)
   to find out more about the `Fixture` type.
   We create a new test suite at `test/fixtures/typescript/predicate.spec.ts`:

```typescript
import { testFixture } from '../Fixture.js'

describe('typescript predicates', () => {
  describe('should parse a predicate', () => {
    testFixture({
      input: 'x is string',
      modes: ['typescript'],
      expected: {
        type: 'JsdocTypePredicate',
        left: {
          type: 'JsdocTypeName',
          value: 'x'
        },
        right: {
          type: 'JsdocTypeName',
          value: 'string'
        }
      }
    })
  })
})
```

7. Add new tokens. If we run the test again we will get an error for our unit test and can actually start developing our
   feature. The message is `Error: The parsing ended early. The next token was: 'Identifier' with value 'is'`. It tells us
   that the lexer was not able to parse `is` as a token, but treats it as an identifier. To fix this we add `'is'` to
   the `TokenType` in `src/lexer/Token.ts` and create a new lexing rule in `src/lexer/Lexer.ts`. As this is just a static
   text token, we can just add `makeKeyWordRule('is')` to the `rules` array.

8. Add a parslet. The next error is `Error: The parsing ended early. The next token was: 'is' with value 'is'`, which
   tells us that a parslet is missing. We create a new file `src/parslets/predicateParslet.ts` and use `composeParslet` to
   create a parslet.

```typescript
import { composeParslet } from './Parslet.js'

export const predicateParslet = composeParslet({
  name: 'predicateParslet'
})
```
9. Decide if it is a prefix or infix parslet (postfix are also infix parslets). The token we recognize is the `is`. As
   this is syntactically an infix operator we can use the `parseInfix` parameter of `composeParslet`. Also we need to add
   the `accept` parameter to indicate that we accept tokens of type `is`. For infix parslets we also need to specify the
   precedence which could be explained as the 'binding strength' of the infix operator. For now we will just choose
   `Precendence.INFIX` and see if something else fails.

```typescript
import { composeParslet } from './Parslet.js'
import { Precedence } from '../Precedence.js'

export const predicateParslet = composeParslet({
  name: 'predicateParslet',
  precedence: Precedence.INFIX,
  accept: type => type === 'is',
  parseInfix: (parser, left) => {

  }
})
```

10. Implement `parseInfix`. Here `parser` is the currently used parser and `left` is the already parsed part. So we ensure
   that `left` is indeed a name. If that is the case we can now safely `consume` the `is` token. With this we tell the parser
   that we can continue parsing the next token and then proceed to assemble the AST and recursively continue parsing the `right` part of our
   expression. To ensure that we indeed get a `RootResult` for our right expression we can use the function `assertRoot`.
   This prevents us from getting special results like a `KeyValueResult` which is only valid in certain contexts
   (for example in object types or function parameter lists). The resulting file looks like this:

```typescript
import { composeParslet } from './Parslet.js'
import { Precedence } from '../Precedence.js'
import { UnexpectedTypeError } from '../errors.js'
import { assertRootResult } from '../assertTypes.js'

export const predicateParslet = composeParslet({
  name: 'predicateParslet',
  precedence: Precedence.INFIX,
  accept: type => type === 'is',
  parseInfix: (parser, left) => {
    if (left.type !== 'JsdocTypeName') {
      throw new UnexpectedTypeError(left, 'A TypeScript predicate always has to have a name on the left side.')
    }

    parser.consume('is')

    return {
      type: 'JsdocTypePredicate',
      left,
      right: assertRootResult(parser.parseIntermediateType(Precedence.INFIX))
    }
  }
})
```

11. Add parslet to grammar. Now we need to tell the parser that we actually want to use this parslet. For this we add
    the parslet to the `typescriptGrammar` array in `src/grammars/typescriptGrammar.ts`.

12. Run tests and debug until done. In the end we see that all tests pass, and we are done. We can now add some more tests
    if we like. If you want to run tests on just a particular file, you can temporarily
    rename the file, e.g., to have the ending `.spec1.ts` and then temporarily
    target "spec1" in `.mocharc.json`.

13. If there are any problems with this guide, feel free to open an issue!
