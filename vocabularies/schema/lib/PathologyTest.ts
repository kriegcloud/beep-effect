import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { MedicalTestMixin } from './MedicalTest.js';

export interface PathologyTest<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.MedicalTest<D>, rdfine.RdfResource<D> {
  tissueSample: string | undefined;
}

export function PathologyTestMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<PathologyTest & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class PathologyTestClass extends MedicalTestMixin(Resource) {
    @rdfine.property.literal()
    tissueSample: string | undefined;
  }
  return PathologyTestClass as any
}
PathologyTestMixin.appliesTo = schema.PathologyTest
PathologyTestMixin.createFactory = (env: RdfineEnvironment) => createFactory<PathologyTest>([MedicalTestMixin, PathologyTestMixin], { types: [schema.PathologyTest] }, env)
