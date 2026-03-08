import '../extensions/sh/AbstractResult.js';
import { AbstractResultMixinEx } from '../extensions/sh/AbstractResult.js';
import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { dash } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Dash from '../index.js';
import type * as Shacl from '@rdfine/shacl';
import { AbstractResultMixin as ShaclAbstractResultMixin } from '@rdfine/shacl/lib/AbstractResult';

export interface TestCaseResult<D extends RDF.DatasetCore = RDF.DatasetCore> extends Shacl.AbstractResult<D>, rdfine.RdfResource<D> {
}

export function TestCaseResultMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<TestCaseResult & RdfResourceCore> & Base {
  @rdfine.namespace(dash)
  class TestCaseResultClass extends AbstractResultMixinEx(ShaclAbstractResultMixin(Resource)) {
  }
  return TestCaseResultClass as any
}
TestCaseResultMixin.appliesTo = dash.TestCaseResult
TestCaseResultMixin.createFactory = (env: RdfineEnvironment) => createFactory<TestCaseResult>([ShaclAbstractResultMixin, TestCaseResultMixin], { types: [dash.TestCaseResult] }, env)
