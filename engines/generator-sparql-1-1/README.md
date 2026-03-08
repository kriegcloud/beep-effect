<p align="center">
    <img alt="Traqula logo" width="70%" style="border-radius: 20px" src="/assets/white-on-red/logo-white-on-red-lettered-social.png">
</p>

<p align="center">
  <strong>A query language transpiler framework for JavaScript</strong>
</p>

# Traqula SPARQL 1.1 generator

[![npm version](https://badge.fury.io/js/@traqula%2Fgenerator-sparql-1-1.svg)](https://www.npmjs.com/package/@traqula/generator-sparql-1-1)

Traqula Generator SPARQL 1.1 is a [SPARQL 1.1](https://www.w3.org/TR/sparql11-query/#grammar) query generator for TypeScript.
It can generate SPARQL given the AST created by [Traqula parser SPARQL 1.1](https://github.com/comunica/traqula/tree/main/engines/parser-sparql-1-1).

## Installation

```bash
npm install @traqula/generator-sparql-1-1
```

or

```bash
yarn add @traqula/generator-sparql-1-1
```

## Import

Either through ESM import:

```javascript
import { Generator } from 'engines/generator-sparql-1-1';
```

_or_ CJS require:

```javascript
const Generator = require('engines/generator-sparql-1-1').Generator;
```

## Usage

This package contains a `Generator` that is able to generate SPARQL 1.1 queries:

```typescript
import { Parser } from 'parser/generator-sparql-1-1';
import { Generator } from 'engines/generator-sparql-1-1';
const query = `SELECT * WHERE { ?s ?p ?o }`
const parser = new Parser();
const ast = parser.parse(query)

const generator = new Generator();
const queryString = generator.generate(ast);
```

Note that a single generator cannot generate multiple queries in parallel.

## Configuration

Optionally, the following parameters can be set in to the generator:

* `astFactory`: A custom AstFactory that is able to create the various AST nodes. _(default: `new AstFactory`)_
* `indentInc`: the number of spaces the built-in 'pretty print' mode must print for a single indentation level. _(default: `2`)_.
* `origSource`: the original query string the ast is constructed from.
* `[traqulaIndentation]` from `@traqula/core`: the current number of spaces to print on a newline.
Whenever this number is negative, no newline will be printed. _(default: 0)_
* `[traqulaNewlineAlternative]` from `@traqula/core`: the character that should be printed instead of a newline in case `[traqulaIndentation]` is negative. _(default: ' ')_

> [!note]
> To create a generator without pretty print:
> ```typescript
> import { Generator } from '@traqula/generator-sparql-1-1';
> import { traqulaIndentation } from '@traqula/core';
> const flatGenerator = new Generator({
>   indentInc: 0,
>   [traqulaIndentation]: -1,
> })
> ```

## Round-tripping generation

By default, the generator will emit the round tripped query string where possible.
In order to create an AST that supports round-tripping, you should make sure the [parser is set up correctly](../parser-sparql-1-1/README.md#collecting-round-tripping-information).
