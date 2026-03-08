<p align="center">
    <img alt="Traqula logo" width="70%" style="border-radius: 20px" src="/assets/white-on-red/logo-white-on-red-lettered-social.png">
</p>

<p align="center">
  <strong>A query language transpiler framework for JavaScript</strong>
</p>

# Traqula parser engine for SPARQL 1.1

[![npm version](https://badge.fury.io/js/@traqula%2Fparser-sparql-1-1.svg)](https://www.npmjs.com/package/@traqula/parser-sparql-1-1)

Traqula Sparql 1.1 is a [SPARQL 1.1](https://www.w3.org/TR/sparql11-query/#grammar) query parser for TypeScript.

## Installation

```bash
npm install @traqula/parser-sparql-1-1
```

or

```bash
yarn add @traqula/parser-sparql-1-1
```

## Import

Either through ESM import:

```javascript
import { Parser } from '@traqula/parser-sparql-1-1';
```

_or_ CJS require:

```javascript
const Parser = require('@traqula/parser-sparql-1-1').Parser;
```

## Usage

This package contains a `Parser` that is able to parse SPARQL 1.1 queries:

```typescript
const parser = new Parser();
const abstractSyntaxTree = parser.parse('SELECT * { ?s ?p ?o }');
```

Note that a single parser cannot parse multiple queries in parallel.

The package also contains multiple parserBuilders.
These builders can be used either to consume to a parser, or to usage as a starting point for your own grammar.

Note: it is essential that you reuse created parser to the full extent.
Traqula builds on top of [Chevrotain](https://chevrotain.io/docs/), an amazing project that allows for the definition of parsers within JavaScript, since the definition of the parser is part of the program, so is the optimization of our parser. Everytime you create a parser, the grammar optimizations need to be computed again.

## Configuration

Optionally, the following parameters can be set in the Parsers defaultContext:

* `dataFactory`: A custom [RDFJS DataFactory](http://rdf.js.org/#datafactory-interface) to construct terms and triples. _(Default: `require('@rdfjs/data-model')`)_
* `skipValidation`: Can be used to disable the validation that used variables in a select clause are in scope. _(Default: `false`)_

## AstFactory and AstTransformer

Traqula provides two tools to help you manipulate an AST.
The `AstFactory` helps you create AST nodes and validate the type of node using [type predicates](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates).
When creating nodes, the first argument will always be a SourceLocation,
in case you are not using [round tripping](#collecting-round-tripping-information), you can just provide `F.gen()`.

The transformer is a strongly typed generic yet optimized tree transformer.
The `AstTransformer` is a type specified `TransformerSubTyped` and can be used as is on the Ast Nodes.

```typescript
import { Parser } from '@traqula/parser-sparql-1-1';
import { AstTransformer, AstFactory } from '@traqula/rules-sparql-1-1';
const query = `SELECT * { ?s ?p ?o }`;
const parser = new Parser();
const F = new AstFactory();
const transformer = new AstTransformer();

const ast = parser.parse(query);
// expand variables s p and o to their long names:
// SELECT * { ?subject ?predicate ?object }
transformer.transformNodeSpecific<'unsafe', typeof ast>(ast, {}, {
  // Something of type 'term'
  term: {
    // With subtype 'variable'
    variable: {
      transform: (variable) => {
        const newName = {
          's': 'subject',
          'p': 'predicate',
          'o': 'object'
        }[variable.value];
        return F.termVariable(newName ?? variable.value, F.gen());
      }
    }
  }
});
```

> [!note]
> The transformer will return a safe version of the node by default,
> meaning it will return the ast node, but say the values for all keys are unknown since they could have been replaced by any new value in the course of performing the transformation.
> To just get the type of the node you provide the generic `'unsafe'`.
> Likewise the returned value of the transform function is `unknown` unless you call unsafe and provide the expected type.

## Collecting round tripping information

The generated AST is constructed such that it allows for round tripping.
This means that a parsed query string produces an AST that, when generated from provides **exactly** the same query string.
By default, though, the configured lexer does not collect enough information to enable this because it comes at a small slowdown ([see our report](https://traqula-resource.jitsedesmet.be/#traqula-bench)).
Simply provide the following configuration to the parser, a astFactory that handles source information, and a lexerConfig that states location information should be collected:
```typescript
import { AstFactory } from '@traqula/rules-sparql-1-1';
import { adjustParserBuilder, adjustLexerBuilder, Parser } from '@traqula/parser-sparql-1-1';
const sourceTrackingAstFactory = new AstFactory();
const sourceTrackingParser = new Parser({
  defaultContext: { astFactory: sourceTrackingAstFactory },
  lexerConfig: { positionTracking: 'full' },
});
```
