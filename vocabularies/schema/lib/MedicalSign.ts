import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { MedicalSignOrSymptomMixin } from './MedicalSignOrSymptom.js';

export interface MedicalSign<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.MedicalSignOrSymptom<D>, rdfine.RdfResource<D> {
  identifyingExam: Schema.PhysicalExam | undefined;
  identifyingTest: Schema.MedicalTest<D> | undefined;
}

export function MedicalSignMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<MedicalSign & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class MedicalSignClass extends MedicalSignOrSymptomMixin(Resource) {
    @rdfine.property()
    identifyingExam: Schema.PhysicalExam | undefined;
    @rdfine.property.resource()
    identifyingTest: Schema.MedicalTest | undefined;
  }
  return MedicalSignClass as any
}
MedicalSignMixin.appliesTo = schema.MedicalSign
MedicalSignMixin.createFactory = (env: RdfineEnvironment) => createFactory<MedicalSign>([MedicalSignOrSymptomMixin, MedicalSignMixin], { types: [schema.MedicalSign] }, env)
