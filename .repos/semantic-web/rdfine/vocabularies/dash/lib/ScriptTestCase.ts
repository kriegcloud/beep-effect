import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { dash } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Dash from '../index.js';
import { ScriptMixin } from './Script.js';
import { TestCaseMixin } from './TestCase.js';

export interface ScriptTestCase<D extends RDF.DatasetCore = RDF.DatasetCore> extends Dash.Script<D>, Dash.TestCase<D>, rdfine.RdfResource<D> {
}

export function ScriptTestCaseMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ScriptTestCase & RdfResourceCore> & Base {
  @rdfine.namespace(dash)
  class ScriptTestCaseClass extends TestCaseMixin(ScriptMixin(Resource)) {
  }
  return ScriptTestCaseClass as any
}
ScriptTestCaseMixin.appliesTo = dash.ScriptTestCase
ScriptTestCaseMixin.createFactory = (env: RdfineEnvironment) => createFactory<ScriptTestCase>([TestCaseMixin, ScriptMixin, ScriptTestCaseMixin], { types: [dash.ScriptTestCase] }, env)
