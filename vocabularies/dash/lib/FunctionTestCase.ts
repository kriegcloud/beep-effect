import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { dash } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Dash from '../index.js';
import { TestCaseMixin } from './TestCase.js';

export interface FunctionTestCase<D extends RDF.DatasetCore = RDF.DatasetCore> extends Dash.TestCase<D>, rdfine.RdfResource<D> {
}

export function FunctionTestCaseMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<FunctionTestCase & RdfResourceCore> & Base {
  @rdfine.namespace(dash)
  class FunctionTestCaseClass extends TestCaseMixin(Resource) {
  }
  return FunctionTestCaseClass as any
}
FunctionTestCaseMixin.appliesTo = dash.FunctionTestCase
FunctionTestCaseMixin.createFactory = (env: RdfineEnvironment) => createFactory<FunctionTestCase>([TestCaseMixin, FunctionTestCaseMixin], { types: [dash.FunctionTestCase] }, env)
