import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { MedicalConditionMixin } from './MedicalCondition.js';

export interface MedicalSignOrSymptom<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.MedicalCondition<D>, rdfine.RdfResource<D> {
  possibleTreatment: Schema.MedicalTherapy<D> | undefined;
}

export function MedicalSignOrSymptomMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<MedicalSignOrSymptom & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class MedicalSignOrSymptomClass extends MedicalConditionMixin(Resource) {
    @rdfine.property.resource()
    possibleTreatment: Schema.MedicalTherapy | undefined;
  }
  return MedicalSignOrSymptomClass as any
}
MedicalSignOrSymptomMixin.appliesTo = schema.MedicalSignOrSymptom
MedicalSignOrSymptomMixin.createFactory = (env: RdfineEnvironment) => createFactory<MedicalSignOrSymptom>([MedicalConditionMixin, MedicalSignOrSymptomMixin], { types: [schema.MedicalSignOrSymptom] }, env)
