import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { dash } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Dash from '../index.js';
import { TestCaseMixin } from './TestCase.js';

export interface GraphStoreTestCase<D extends RDF.DatasetCore = RDF.DatasetCore> extends Dash.TestCase<D>, rdfine.RdfResource<D> {
}

export function GraphStoreTestCaseMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<GraphStoreTestCase & RdfResourceCore> & Base {
  @rdfine.namespace(dash)
  class GraphStoreTestCaseClass extends TestCaseMixin(Resource) {
  }
  return GraphStoreTestCaseClass as any
}
GraphStoreTestCaseMixin.appliesTo = dash.GraphStoreTestCase
GraphStoreTestCaseMixin.createFactory = (env: RdfineEnvironment) => createFactory<GraphStoreTestCase>([TestCaseMixin, GraphStoreTestCaseMixin], { types: [dash.GraphStoreTestCase] }, env)
