import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { MedicalSignOrSymptomMixin } from './MedicalSignOrSymptom.js';

export interface MedicalSymptom<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.MedicalSignOrSymptom<D>, rdfine.RdfResource<D> {
}

export function MedicalSymptomMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<MedicalSymptom & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class MedicalSymptomClass extends MedicalSignOrSymptomMixin(Resource) {
  }
  return MedicalSymptomClass as any
}
MedicalSymptomMixin.appliesTo = schema.MedicalSymptom
MedicalSymptomMixin.createFactory = (env: RdfineEnvironment) => createFactory<MedicalSymptom>([MedicalSignOrSymptomMixin, MedicalSymptomMixin], { types: [schema.MedicalSymptom] }, env)
