import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { dash } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Dash from '../index.js';
import { TestCaseMixin } from './TestCase.js';

export interface ActionTestCase<D extends RDF.DatasetCore = RDF.DatasetCore> extends Dash.TestCase<D>, rdfine.RdfResource<D> {
}

export function ActionTestCaseMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ActionTestCase & RdfResourceCore> & Base {
  @rdfine.namespace(dash)
  class ActionTestCaseClass extends TestCaseMixin(Resource) {
  }
  return ActionTestCaseClass as any
}
ActionTestCaseMixin.appliesTo = dash.ActionTestCase
ActionTestCaseMixin.createFactory = (env: RdfineEnvironment) => createFactory<ActionTestCase>([TestCaseMixin, ActionTestCaseMixin], { types: [dash.ActionTestCase] }, env)
