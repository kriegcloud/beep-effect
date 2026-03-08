import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CivicStructureMixin } from './CivicStructure.js';
import { EmergencyServiceMixin } from './EmergencyService.js';
import { MedicalOrganizationMixin } from './MedicalOrganization.js';

export interface Hospital<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CivicStructure<D>, Schema.EmergencyService<D>, Schema.MedicalOrganization<D>, rdfine.RdfResource<D> {
  availableService: Schema.MedicalProcedure<D> | Schema.MedicalTest<D> | Schema.MedicalTherapy<D> | undefined;
  healthcareReportingData: Schema.CDCPMDRecord<D> | Schema.Dataset<D> | undefined;
  medicalSpecialty: Schema.MedicalSpecialty | undefined;
}

export function HospitalMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Hospital & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class HospitalClass extends MedicalOrganizationMixin(EmergencyServiceMixin(CivicStructureMixin(Resource))) {
    @rdfine.property.resource()
    availableService: Schema.MedicalProcedure | Schema.MedicalTest | Schema.MedicalTherapy | undefined;
    @rdfine.property.resource()
    healthcareReportingData: Schema.CDCPMDRecord | Schema.Dataset | undefined;
    @rdfine.property()
    medicalSpecialty: Schema.MedicalSpecialty | undefined;
  }
  return HospitalClass as any
}
HospitalMixin.appliesTo = schema.Hospital
HospitalMixin.createFactory = (env: RdfineEnvironment) => createFactory<Hospital>([MedicalOrganizationMixin, EmergencyServiceMixin, CivicStructureMixin, HospitalMixin], { types: [schema.Hospital] }, env)
