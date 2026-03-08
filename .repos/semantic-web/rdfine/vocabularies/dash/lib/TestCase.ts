import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { dash } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Dash from '../index.js';
import type * as Rdfs from '@rdfine/rdfs';
import { ResourceMixin as RdfsResourceMixin } from '@rdfine/rdfs/lib/Resource';

export interface TestCase<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rdfs.Resource<D>, rdfine.RdfResource<D> {
  expectedResult: Array<RDF.Term>;
  expectedResultIsTTL: boolean | undefined;
}

export function TestCaseMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<TestCase & RdfResourceCore> & Base {
  @rdfine.namespace(dash)
  class TestCaseClass extends RdfsResourceMixin(Resource) {
    @rdfine.property({ values: 'array' })
    expectedResult!: Array<RDF.Term>;
    @rdfine.property.literal({ type: Boolean })
    expectedResultIsTTL: boolean | undefined;
  }
  return TestCaseClass as any
}
TestCaseMixin.appliesTo = dash.TestCase
TestCaseMixin.createFactory = (env: RdfineEnvironment) => createFactory<TestCase>([RdfsResourceMixin, TestCaseMixin], { types: [dash.TestCase] }, env)
