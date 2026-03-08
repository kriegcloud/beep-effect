# Create Parser

Traqula provides a generic core to create a modular [LL(K)-grammar](https://chevrotain.io/docs/features/llk.html) parser
([read our paper for full details](TODO: link)).
Typically, modularity is provided on Parser granularity, allowing you to create a parser by extending an existing parser.
This kind of extension is similar to how Object-Oriented programming languages allow you to create a class by extending another
(see: [Chevrotain](https://chevrotain.io/docs/features/grammar_inheritance.html), [ANTLR4](https://chevrotain.io/docs/features/grammar_inheritance.html)).
Traqula takes the modularity to the level of grammar rules, allowing you to create a parser by starting from an existing one, then adding, removing or patching existing rules, even allowing you to merge parsers (more information can be found on [modifying a parser](./modify-parser.md)).

> [!note]
> Traqula heavily relies on [Chevrotain](https://chevrotain.io/) to perform efficient parsing.
> Traqula's core itself merely provides a modular system to create a Chevrotain parser using [builder](https://refactoring.guru/design-patterns/builder)-based [dependency injection](https://martinfowler.com/articles/injection.html).

## Chevrotain

Since Traqula starts from Chevrotain, it is important to know that all Chevrorain's documentation is relevant for Traqula to. We will however highlight some core functions:

1. **CONSUME(x)**: Consume a given lexer token.
2. **OPTION(x)**: optionally parse the following
3. **OR(x)**: parse only one from a list of options - first matching gets executed
4. **MANY(x)**: parse the provided many (0 or more) times
5. **MANY_SEP(x)**: parse the provided many times, expecting the consumption of a token between each time
6. **AT_LEAST_ONE(x)**: parse the provided one or more times
7. **AT_LEAST_ONE_SEP(x)**: parse the provided one or more times, expecting the consumption of a token between each time.
8. **ACTION**: perform an action - required for [embedded parsers](https://chevrotain.io/docs/tutorial/step3b_adding_actions_embedded.html) and semantic control.
Every interaction with results from any of the Chevrotain functions need to be in an ACTION since the result is undefined at [grammar recording time](https://chevrotain.io/docs/guide/internals.html#grammar-recording).
9. **SUBRULE(x)**: parse a provided subrule (grammar rule).

These functions are provided to the `ParserRule` `impl` function of `@traqula/core`.
We used the notation `CONSUME(x)` to note that both CONSUME does exist but also `CONSUME1` up to `CONSUME9`,
When providing the same argument to for example `CONSUME`, Chevrotain requires you to index the occurrence so the parser knows _'where it is at'_.

> [!note]
> Since Chevrotain is [ESM only](https://chevrotain.io/docs/changes/BREAKING_CHANGES.html#_11-0-0), but we want to target both CJS and ESM, Traqula depends on a Chevrotain wrapper `@traqula/chevrotain`.

## Creating a lexer

To create a lexer, one simply defines a [token](https://chevrotain.io/docs/tutorial/step1_lexing.html#our-first-token) using `createToken` from `@traqula/core`,
which is a smart typed wrapper around the version Chevrotain provides.

We define a token that parser 'test' in a case-insensitive way:

```typescript
import {createToken} from "@traqula/core";
// We recommend using cpaitalized names for tokens.
const testToken = createToken({ name: 'Test', pattern: /TEST/i });
const wordToken = createToken({ name: 'Word', pattern: /[a-z]+/i });
```

To create a lexer, you simply add them to a `LexerBuilder`, and build lexer:

```typescript
import {LexerBuilder} from "@traqula/core";
const myLexerbuilder = LexerBuilder.create().add(wordToken, testToken)
```

However: LexerBuilders function as an arrayBuilder where the lexer will lex tokens checking in the order of that array. In our example above our lexer would thus never lex the `testToken` because 'test' would first match the `wordToken`. To this end we manipulate our builder:

```typescript
// Move the testToken before the wordToken in our array.
myLexerBuilder.moveBefore(wordToken, testToken)
// Alternitavely:
const myOtherLexerBuilder = LexerBuilder.create().add(testToken, wordToken);
```

> [!note]
> Chevrotain will try to warn you if a token can never be matched.

Using a lexerBuilder, you can either create a [Chevrotain lexer](https://chevrotain.io/docs/tutorial/step1_lexing.html#using-the-lexer) using `.build()`, or get the tokenVocabulary to provide to the parser builder using `.tokenVocabulary`.

## ParserRule

Traqula's core package exposes [ParserRule](https://comunica.github.io/traqula/types/_traqula_core.ParserRule.html) which is the type used to create a single grammar rule.
The type expects you to specify the `Context` the rule expects, a `name`, the type the rule returns,
and optionally the
[parameters](https://chevrotain.io/docs/features/parameterized_rules.html#parameterized-rules) of the grammar rule.
You should then declare the rule as an object containing the `name`,
and an `impl` that receives the chevrotain specific functions, returning a function thet receives: the context, and all parameters, which in turn returns something of the returnType.
below we define a simple rule named `myRule` (we suggest starting with a lowercase letter here), requiring a context `{ myKey: 'myValue' }`, and a single string parameter, returning the string `apple`:
```typescript
//                           context      -      name  -  returnType - list of arguments
const myRuleObj: ParserRule<{ myKey: 'myValue' }, 'myRule', 'apple', [ string ]> = {
  name: 'myRule',
  impl: ({ CONSUME, SUBRULE, ACTION }) => (context, firstRuleParameter) => {
    CONSUME(testToken);
    SUBRULE(otherRule);
    return ACTION(() => 'apple');
  }
}
```

> [!note]
> When calling a subRule (e.g. `SUBRULE(otherRule)`), Traqula does NOT just call the implementation (`impl`) on that `otherRule`. Instead, it calls the rule that is _currently registered in the parser_ under the same name, providing the key to Traqula's modularity.

> [!important]
> Always provide the [string literal type](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#literal-types) for the rule name, as the ParserBuilder will help you at compile time to verify the construction.

## Build Parser:

In order to build a modular parser, we group together the various grammar rules in a `ParserBuilder`.
The ParserBuilder will check that name (which works as the reference to the grammarRule) is only added once.
TypeScript will error on a call that tries to add a rule that is already contained within the builder.

```typescript
const myParserBuilder = ParserBuilder
  // <const> cast required in .create()
  .create(<const> [myRuleObj, otherRule]);
```

> [!note]
> When creating be carefully not to add too many rules to the parser using a single call to `.create` or `.addMany`.
> When doing this, tsc might become unhappy and throw in a similar way that it does when you would add duplicate rules.

In case you want to merge a whole ParserBuilder,
you can call `.merge()` and provide the other ParserBuilder, possibly requiring you to resolve conflicts when name clashes present.

Building the chevrotain parser is possible using `.build()`, interestingly, Chevrotain allows [multiple start rules](https://chevrotain.io/docs/features/multiple_start_rules.html), so you can parse starting from any grammar rule.

```typescript
const myParser = myParserBuilder.build({
  tokenVocabulary: myLexerBuilder.tokenVocabulary,
  // By default, the positionTracking will be off as to ensure maximal
  lexerConfig: {
    // Default position tracking is `onlyOffset` since it is faster,
    // but the errors generated are much more obscure.
    positionTracking: 'full',
    // SkipValidation can be off when you know the implementation of the lexer is correct.
    // While testing however, we suggest you do not skip this step.
    skipValidations: false,
  },
  parserConfig: {
    // SkipValidation can be off when you know the implementation of the parser is correct.
    // While testing however, we suggest you do not skip this step.
    skipValidations: false,
  },
});
//            parse string        the context
myParser.myRule('test me', { myKey: 'myValue' });
```

> [!important]
> When creating a new parser,
> disable `skipValidation` and only remove it once the implementation is final and correct.

> [!important]
> Building a parser is an expensive operator since Chevrotain needs to perform its [grammar recording](https://chevrotain.io/docs/guide/internals.html#grammar-recording). One should therefore always try to reuse a created parser.

## Round tripping on self created parser.

By default, a parser and accompanying generator ([see creating a generator](./create-generator.md)) created using `@traqula/core`
should be able to support round tripping.
By default, to support this, the generator will require the original string for this to work.
However, you can also choose to manipulate the AST in such a way that it delivers the original string to the generator:

```typescript
import { SourceLocationInlinedSource } from '@traqula/core';
const myAst = myParser.myRule('test me', { myKey: 'myValue' });
myAst.loc = {
  sourceLocationType: 'inlinedSource',
  newSource: 'test me',
  start: 0,
  end: Number.MAX_SAFE_INTEGER,
  loc: myAst.loc,
  startOnNew: 0,
  endOnNew: 'test me'.length,
} satisfies SourceLocationInlinedSource;
```
