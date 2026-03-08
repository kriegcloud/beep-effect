import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { MedicalOrganizationMixin } from './MedicalOrganization.js';

export interface Pharmacy<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.MedicalOrganization<D>, rdfine.RdfResource<D> {
}

export function PharmacyMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Pharmacy & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class PharmacyClass extends MedicalOrganizationMixin(Resource) {
  }
  return PharmacyClass as any
}
PharmacyMixin.appliesTo = schema.Pharmacy
PharmacyMixin.createFactory = (env: RdfineEnvironment) => createFactory<Pharmacy>([MedicalOrganizationMixin, PharmacyMixin], { types: [schema.Pharmacy] }, env)
