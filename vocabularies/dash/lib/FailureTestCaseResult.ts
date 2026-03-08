import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { dash } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Dash from '../index.js';
import { TestCaseResultMixin } from './TestCaseResult.js';

export interface FailureTestCaseResult<D extends RDF.DatasetCore = RDF.DatasetCore> extends Dash.TestCaseResult<D>, rdfine.RdfResource<D> {
}

export function FailureTestCaseResultMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<FailureTestCaseResult & RdfResourceCore> & Base {
  @rdfine.namespace(dash)
  class FailureTestCaseResultClass extends TestCaseResultMixin(Resource) {
  }
  return FailureTestCaseResultClass as any
}
FailureTestCaseResultMixin.appliesTo = dash.FailureTestCaseResult
FailureTestCaseResultMixin.createFactory = (env: RdfineEnvironment) => createFactory<FailureTestCaseResult>([TestCaseResultMixin, FailureTestCaseResultMixin], { types: [dash.FailureTestCaseResult] }, env)
