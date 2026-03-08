import type { SparqlContext } from '@traqula/rules-sparql-1-1';
import { ErrorSkipped } from 'rdf-test-suite';
import { Parser } from '../lib/index.js';

export function parse(query: string, context: Partial<SparqlContext> = {}): void {
  const parser = new Parser();
  parser.parse(query, context);
}
export function query(): Promise<never> {
  return Promise.reject(new ErrorSkipped('Querying is not supported'));
}

export function update(): Promise<never> {
  return Promise.reject(new ErrorSkipped('Updating is not supported'));
}
