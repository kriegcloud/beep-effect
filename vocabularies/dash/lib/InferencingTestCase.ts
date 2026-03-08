import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { dash } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Dash from '../index.js';
import { TestCaseMixin } from './TestCase.js';

export interface InferencingTestCase<D extends RDF.DatasetCore = RDF.DatasetCore> extends Dash.TestCase<D>, rdfine.RdfResource<D> {
}

export function InferencingTestCaseMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<InferencingTestCase & RdfResourceCore> & Base {
  @rdfine.namespace(dash)
  class InferencingTestCaseClass extends TestCaseMixin(Resource) {
  }
  return InferencingTestCaseClass as any
}
InferencingTestCaseMixin.appliesTo = dash.InferencingTestCase
InferencingTestCaseMixin.createFactory = (env: RdfineEnvironment) => createFactory<InferencingTestCase>([TestCaseMixin, InferencingTestCaseMixin], { types: [dash.InferencingTestCase] }, env)
