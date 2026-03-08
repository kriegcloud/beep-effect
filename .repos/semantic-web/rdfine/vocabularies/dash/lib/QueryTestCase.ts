import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { dash } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Dash from '../index.js';
import type * as Shacl from '@rdfine/shacl';
import { SPARQLSelectExecutableMixin as ShaclSPARQLSelectExecutableMixin } from '@rdfine/shacl/lib/SPARQLSelectExecutable';
import { TestCaseMixin } from './TestCase.js';

export interface QueryTestCase<D extends RDF.DatasetCore = RDF.DatasetCore> extends Shacl.SPARQLSelectExecutable<D>, Dash.TestCase<D>, rdfine.RdfResource<D> {
}

export function QueryTestCaseMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<QueryTestCase & RdfResourceCore> & Base {
  @rdfine.namespace(dash)
  class QueryTestCaseClass extends TestCaseMixin(ShaclSPARQLSelectExecutableMixin(Resource)) {
  }
  return QueryTestCaseClass as any
}
QueryTestCaseMixin.appliesTo = dash.QueryTestCase
QueryTestCaseMixin.createFactory = (env: RdfineEnvironment) => createFactory<QueryTestCase>([TestCaseMixin, ShaclSPARQLSelectExecutableMixin, QueryTestCaseMixin], { types: [dash.QueryTestCase] }, env)
