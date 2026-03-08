import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { MedicalAudienceMixin } from './MedicalAudience.js';
import { PersonMixin } from './Person.js';

export interface Patient<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.MedicalAudience<D>, Schema.Person<D>, rdfine.RdfResource<D> {
  diagnosis: Schema.MedicalCondition<D> | undefined;
  drug: Schema.Drug<D> | undefined;
  healthCondition: Schema.MedicalCondition<D> | undefined;
}

export function PatientMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Patient & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class PatientClass extends PersonMixin(MedicalAudienceMixin(Resource)) {
    @rdfine.property.resource()
    diagnosis: Schema.MedicalCondition | undefined;
    @rdfine.property.resource()
    drug: Schema.Drug | undefined;
    @rdfine.property.resource()
    healthCondition: Schema.MedicalCondition | undefined;
  }
  return PatientClass as any
}
PatientMixin.appliesTo = schema.Patient
PatientMixin.createFactory = (env: RdfineEnvironment) => createFactory<Patient>([PersonMixin, MedicalAudienceMixin, PatientMixin], { types: [schema.Patient] }, env)
