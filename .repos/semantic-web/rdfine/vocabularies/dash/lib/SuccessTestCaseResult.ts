import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { dash } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Dash from '../index.js';
import { TestCaseResultMixin } from './TestCaseResult.js';

export interface SuccessTestCaseResult<D extends RDF.DatasetCore = RDF.DatasetCore> extends Dash.TestCaseResult<D>, rdfine.RdfResource<D> {
}

export function SuccessTestCaseResultMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<SuccessTestCaseResult & RdfResourceCore> & Base {
  @rdfine.namespace(dash)
  class SuccessTestCaseResultClass extends TestCaseResultMixin(Resource) {
  }
  return SuccessTestCaseResultClass as any
}
SuccessTestCaseResultMixin.appliesTo = dash.SuccessTestCaseResult
SuccessTestCaseResultMixin.createFactory = (env: RdfineEnvironment) => createFactory<SuccessTestCaseResult>([TestCaseResultMixin, SuccessTestCaseResultMixin], { types: [dash.SuccessTestCaseResult] }, env)
