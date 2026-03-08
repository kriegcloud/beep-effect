<p align="center">
    <img alt="Traqula logo" width="70%" style="border-radius: 20px" src="/assets/white-on-red/logo-white-on-red-lettered-social.png">
</p>

<p align="center">
  <strong>A query language transpiler framework for JavaScript</strong>
</p>

# Traqula SPARQL 1.2 generator

[![npm version](https://badge.fury.io/js/@traqula%2Fgenerator-sparql-1-2.svg)](https://www.npmjs.com/package/@traqula/generator-sparql-1-2)

Traqula Generator Sparql 1.2 is a [SPARQL 1.2](https://www.w3.org/TR/sparql12-query/#grammar) query generator for TypeScript.
It can generate SPARQL given the AST created by [Traqula parser SPARQL 1-2](https://github.com/comunica/traqula/tree/main/engines/parser-sparql-1-2).

## Installation

```bash
npm install @traqula/generator-sparql-1-2
```

or

```bash
yarn add @traqula/generator-sparql-1-2
```

## Import

Either through ESM import:

```javascript
import { Generator } from '@traqula/generator-sparql-1-2';
```

_or_ CJS require:

```javascript
const Generator = require('@traqula/generator-sparql-1-2').Generator;
```

## Usage

This package contains a `Generator` that is able to generate SPARQL 1.2 queries:

```typescript
const generator = new Generator();
const abstractSyntaxTree = generator.generate(abstractSyntaxTree);
```

Note that a single generator cannot generate multiple queries in parallel.
The generator is constructed as a simple extansion of the existing [SPARQL 1.1 generator](../generator-sparql-1-1), the documentation of that generator thus also holds for this one.
