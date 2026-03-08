# Traqula core package

[![npm version](https://badge.fury.io/js/@traqula%2Fcore.svg)](https://www.npmjs.com/package/@traqula/core)

Traqula core contains core components of Traqula.
Most importantly, its [lexer builder](./lib/lexer-builder/LexerBuilder.ts), [parser builder](./lib/parser-builder/parserBuilder.ts), and [generator builder](./lib/generator-builder/generatorBuilder.ts);
 as well as providing generic DAG transformers/ visitors.
This library heavily relies on the amazing [Chevrotain package](https://chevrotain.io/docs/).
Knowing the basics of that package will allow you to quickly generate your own grammars.

## Installation

```bash
npm install @traqula/core
```

or

```bash
yarn add @traqula/core
```

## Usage

Each parser contains two steps:
1. a lexer
2. a grammar + abstract syntax tree generation step.

Sometimes grammar definitions and abstract syntax tree generation is split into separate steps.
In this library, we choose to keep the two together when building a parser.

### Lexer Builder

To tackle the first step, a lexer should be created.
This is a system that separates different groups of characters into annotated groups.
In human language for example the sentence 'I eat apples' is lexed into different groups called **tokens** namely `words` and `spaces`:
`I`, ` `, `eat`, ` `, `apples`.

To create a token definition, you use the provided function `createToken` like:
```typescript
const select = createToken({ name: 'Select', pattern: /select/i, label: 'SELECT' });
```

Lexer definitions are then put in a list and when a lexer is build, the lexer will match a string to the [**first token in the list**](https://chevrotain.io/docs/tutorial/step1_lexing.html#creating-the-lexer) that matches.
Note that the order of definitions in the list is thus essential.

We therefore use a [lexer builder](./lib/lexer-builder/LexerBuilder.ts) which allows you to easily:
1. change the order of lexer rules,
2. and create a new lexer staring from an existing one.

Creating a builder is as easy as:

```typescript
const sparql11Tokens = LexerBuilder.create(<const> [select, describe]);
```

A new lexer can be created from an existing one, and altered by calling:
```typescript
const sparql11AdjustTokens = LexerBuilder.create(sparql11Tokens).addBefore(select, BuiltInAdjust);
```

### Parser Builder

The grammar builder is used to link together grammar rules such that they can be converted into a parser.
Grammar rule definitions come in the form of [ParserRule](./lib/parser-builder/ruleDefTypes.ts) objects.
Each `ParserRule` object contains its name and its returnType.
Optionally, it can also contain arguments that should be provided to the SUBRULE calls.
A simple example of a grammar rule is the rule bellow that allows you to parse booleanLiterals.

```typescript
/**
 * Parses a boolean literal.
 * [[134]](https://www.w3.org/TR/sparql11-query/#rBooleanLiteral)
 */
export const booleanLiteral: ParserRule<'booleanLiteral', LiteralTerm> = <const> {
    name: 'booleanLiteral',
    impl: ({ CONSUME, OR, context }) => () => OR([
      { ALT: () => context.dataFactory.literal(
          CONSUME(l.true_).image.toLowerCase(),
          context.dataFactory.namedNode(CommonIRIs.BOOLEAN),
        ) },
      { ALT: () => context.dataFactory.literal(
          CONSUME(l.false_).image.toLowerCase(),
          context.dataFactory.namedNode(CommonIRIs.BOOLEAN),
        ) },
    ]),
  };
```

The `impl` member of `ParserRule` is a function that receives:
1. essential functions to create a grammar rule (capitalized members),
2. a context object that can be used by the rules,
3. a cache object ([WeakMap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap)) that can be used to cache the creation of long lists in the parser, [increasing parser performance](https://chevrotain.io/docs/guide/performance.html#caching-arrays-of-alternatives).

You cannot unpack the context entry in the function definition itself because the parser uses a [recording phase](https://chevrotain.io/docs/guide/internals.html#grammar-recording) to optimize itself. During this phase, the context entry will be undefined, as such, it can only be accessed within the `ACTION` function.

The result of an `impl` call is a function called a `rule`.
Rules can be [parameterized](https://chevrotain.io/docs/features/parameterized_rules.html), although I have not found a scenario where that is usefully.
Personally I create a function that can be used to create multiple `ParserRule` objects.
The result of a rule should match the type provided in the `ParserRule` definition, and is the result of a call of `SUBRULE` with that rule.

##### Testing the correctness of your parser
By default, the parser builder will construct a parser that does not perform validation (to be more speedy).
When creating a parser, you best enable the validation by passing a context to the parser builder like:
```typescript
const context = {
  tokenVocabulary: myLexerVoc,
    lexerConfig: {
    skipValidations: false,
      ensureOptimizations: true,
  },
  parserConfig: {
    skipValidations: false,
  },
}
```

#### Patching rules

When a rule definition calls to a subrule using `SUBRULE(mySub)`, the implementation itself is not necessarily called.
That is because the SUBRULE function will call the function with the same name as `mySub` that is present in the current grammarBuilder.

A builder is thus free to override definitions as it pleases. Doing so does however **break the types** and should thus only be done with care.
An example patch is:

```typescript
const myBuilder = Builder
  .createBuilder(<const> [selectOrDescribe, selectRule, describeRule])
  .patchRule(selectRuleAlternative);
```

When `selectOrDescribe` calls what it thinks to be `selectRule`,
it will instead call `selectRuleAlternative` since it overwrote the function `selectRule` with the same name.

When you are creating a new parser,
it might be good to test your parser by setting `skipValidations: false` in the context of the `.build` function.

### Generator Builder

The generator builder function in much the same as the [parser builder](#parser-builder).
Your builder expects objects of type [GeneratorRule](lib/generator-builder/generatorTypes.ts),
containing the implementation of the generator in the `gImpl` member.
The `gImpl` function gets essential functions to create a generator rule (capitalized members),
returning a function that will get the AST and context, returning a string.
For generator rules, you can unpack the context since no recording phase is present in this case.
The idea is that GeneratorRules and ParserRules can be tied together in the same object, as such, similar behaviour is grouped together.

```typescript
/**
 * Parses a named node, either as an IRI or as a prefixed name.
 * [[136]](https://www.w3.org/TR/sparql11-query/#riri)
 */
export const iri: GeneratorRule<'iri', IriTerm> = <const> {
    name: 'iri',
    gImpl: ({ PRINT }) => ast => { PRINT(ast.value) },
  };
```

While implementing a generator, you can easily support pretty print indentation manipulating `traqulaIndentation` context item.
The key for this context item can be accessed like:
```typescript
import { traqulaIndentation } from '@traqula/core';
C[traqulaIndentation] += 2;
```

### A word on round tripping:

The generator builder can significantly help you with creating a round tripping parser.
Basically what that allows you to do is to keep information that the AST finds 'unimportant' within the generated string.
Take for example capitalization and spaces in the sparql spec.
Both are ignored in the AST, but if you want to generate the same string out of your AST, yuo need to store them somewhere.
Traqula helps you store this information using it's `Node` `Localization`.

Localization basically allows you to remember what _portion of the original string_ a node represents.
Take for example the `SENTENCE`: `I Love      Traqula`, If we ignore spaces and caps in the ast, a valid representation would be:
```
SENTENCE-node{ words: [ WORD-node{ value: "i" }, WORD-node{ value: "love" }, WORD-node{ value: "traqula" } ] }
```
If we generated we would loe the capitalisation and get: `i love traqula` for example.
Round tripping will add a `source localization` for each node,
we therefore register that our SENTENCE starts at 0 and ends at 19, while our words have ranges 0-1, 2-6, 12-19.
Using this information our generator can reconstruct the original string (given the original string).
The magic happens when we start manipulating the words, so imagine we want to lowercase the word 'Love',
we would simply annotate in the `localization` that the node should be generated (and not reconstructed),
and we can generate the sentence: `I love      Traqula`.

To support this feature, the generator requires that your AST follows a tree structure with respect to the ranges.
That means that a node cannot start later, or end earlier than its children.
In our example: A sentence cannot start after the first word start, nor can it end before the last word ends.
