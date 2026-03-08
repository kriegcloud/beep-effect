import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { MedicalTestMixin } from './MedicalTest.js';

export interface BloodTest<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.MedicalTest<D>, rdfine.RdfResource<D> {
}

export function BloodTestMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<BloodTest & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class BloodTestClass extends MedicalTestMixin(Resource) {
  }
  return BloodTestClass as any
}
BloodTestMixin.appliesTo = schema.BloodTest
BloodTestMixin.createFactory = (env: RdfineEnvironment) => createFactory<BloodTest>([MedicalTestMixin, BloodTestMixin], { types: [schema.BloodTest] }, env)
