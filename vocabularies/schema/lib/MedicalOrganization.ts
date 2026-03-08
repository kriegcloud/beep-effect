import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { OrganizationMixin } from './Organization.js';

export interface MedicalOrganization<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Organization<D>, rdfine.RdfResource<D> {
  healthPlanNetworkId: string | undefined;
  isAcceptingNewPatients: boolean | undefined;
  medicalSpecialty: Schema.MedicalSpecialty | undefined;
}

export function MedicalOrganizationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<MedicalOrganization & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class MedicalOrganizationClass extends OrganizationMixin(Resource) {
    @rdfine.property.literal()
    healthPlanNetworkId: string | undefined;
    @rdfine.property.literal({ type: Boolean })
    isAcceptingNewPatients: boolean | undefined;
    @rdfine.property()
    medicalSpecialty: Schema.MedicalSpecialty | undefined;
  }
  return MedicalOrganizationClass as any
}
MedicalOrganizationMixin.appliesTo = schema.MedicalOrganization
MedicalOrganizationMixin.createFactory = (env: RdfineEnvironment) => createFactory<MedicalOrganization>([OrganizationMixin, MedicalOrganizationMixin], { types: [schema.MedicalOrganization] }, env)
