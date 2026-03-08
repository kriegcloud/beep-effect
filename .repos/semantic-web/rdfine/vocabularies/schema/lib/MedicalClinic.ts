import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { MedicalOrganizationMixin } from './MedicalOrganization.js';

export interface MedicalClinic<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.MedicalOrganization<D>, rdfine.RdfResource<D> {
  availableService: Schema.MedicalProcedure<D> | Schema.MedicalTest<D> | Schema.MedicalTherapy<D> | undefined;
  medicalSpecialty: Schema.MedicalSpecialty | undefined;
}

export function MedicalClinicMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<MedicalClinic & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class MedicalClinicClass extends MedicalOrganizationMixin(Resource) {
    @rdfine.property.resource()
    availableService: Schema.MedicalProcedure | Schema.MedicalTest | Schema.MedicalTherapy | undefined;
    @rdfine.property()
    medicalSpecialty: Schema.MedicalSpecialty | undefined;
  }
  return MedicalClinicClass as any
}
MedicalClinicMixin.appliesTo = schema.MedicalClinic
MedicalClinicMixin.createFactory = (env: RdfineEnvironment) => createFactory<MedicalClinic>([MedicalOrganizationMixin, MedicalClinicMixin], { types: [schema.MedicalClinic] }, env)
