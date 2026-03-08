/* eslint-disable import/no-nodejs-modules */
import { lstatSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { readFile, readFileSync } from '../fileUtils.js';
import type { NegativeTest } from './generators.js';
import { getStaticFilePath } from './utils.js';

const rootDir = getStaticFilePath('algebra');
const rootSparql = join(rootDir, 'sparql');
const rootJson = join(rootDir, 'algebra');
const rootJsonBlankToVariable = join(rootDir, 'algebra-blank-to-var');

export interface algebraTestGen {
  name: string;
  json: unknown;
  quads: boolean;
  sparql: string | undefined;
}

export type AlgebraTestSuite = 'dawg-syntax' | 'sparql-1.1' | 'sparql11-query' | 'sparql12';

export function sparqlAlgebraTests(suites: AlgebraTestSuite, blankToVariable: boolean, getSPARQL: true):
Generator<algebraTestGen & { sparql: string }>;
export function sparqlAlgebraTests(suites: AlgebraTestSuite, blankToVariable: boolean, getSPARQL: boolean):
Generator<algebraTestGen>;
export function* sparqlAlgebraTests(suite: AlgebraTestSuite, blankToVariable: boolean, getSPARQL: boolean):
Generator<algebraTestGen> {
  // Relative path starting from roots declared above.
  function* subGen(relativePath: string): Generator<algebraTestGen> {
    const absolutePath = join(blankToVariable ? rootJsonBlankToVariable : rootJson, relativePath);
    if (lstatSync(absolutePath).isDirectory()) {
      // Recursion
      for (const sub of readdirSync(absolutePath)) {
        yield* subGen(join(relativePath, sub));
      }
    } else {
      const name = relativePath.replace(/\.json$/u, '');
      const sparqlPath = join(rootSparql, relativePath.replace(/\.json/u, '.sparql'));
      yield {
        name,
        json: JSON.parse(readFileSync(absolutePath)),
        sparql: getSPARQL ? readFileSync(sparqlPath, 'utf8') : undefined,
        quads: name.endsWith('-quads'),
      };
    }
  }

  const subfolders = readdirSync(blankToVariable ? rootJsonBlankToVariable : rootJson);
  if (subfolders.includes(suite)) {
    yield* subGen(suite);
  }
}

type GenQuery = { query: string; name: string };
export function* sparqlQueries(suite: AlgebraTestSuite): Generator<GenQuery> {
  function* subGen(relativePath: string): Generator<GenQuery> {
    const absolutePath = join(rootSparql, relativePath);
    if (lstatSync(absolutePath).isDirectory()) {
      // Recursion
      for (const sub of readdirSync(absolutePath)) {
        yield* subGen(join(relativePath, sub));
      }
    } else {
      const name = relativePath.replace(/\.sparql$/u, '');
      const content = readFileSync(absolutePath, 'utf-8');
      yield {
        name,
        query: content.replaceAll(/\r?\n/gu, '\n'),
      };
    }
  }

  const subfolders = readdirSync(rootSparql);
  if (subfolders.includes(suite)) {
    yield* subGen(suite);
  }
}

export type NegativeAlgebraSuite = 'sparql-1.1-negative' | 'sparql-1.2-negative';

export function* sparqlAlgebraNegativeTests(
  suite: NegativeAlgebraSuite,
  filter?: (name: string) => boolean,
): Generator<NegativeTest> {
  const astDir = getStaticFilePath('algebra');
  const sparqlDir = join(astDir, 'sparql', suite);
  const statics = readdirSync(sparqlDir);
  for (const file of statics) {
    if (file.endsWith('.sparql')) {
      if (filter && !filter(file.replace('.sparql', ''))) {
        continue;
      }
      const name = file.replace(/\.sparql$/u, '');
      yield {
        name,
        statics: async() => {
          const query = await readFile(join(sparqlDir, file));
          return {
            query,
          };
        },
      };
    }
  }
}
