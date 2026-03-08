import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { LocalBusinessMixin } from './LocalBusiness.js';
import { MedicalOrganizationMixin } from './MedicalOrganization.js';

export interface Dentist<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.LocalBusiness<D>, Schema.MedicalOrganization<D>, rdfine.RdfResource<D> {
}

export function DentistMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Dentist & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class DentistClass extends MedicalOrganizationMixin(LocalBusinessMixin(Resource)) {
  }
  return DentistClass as any
}
DentistMixin.appliesTo = schema.Dentist
DentistMixin.createFactory = (env: RdfineEnvironment) => createFactory<Dentist>([MedicalOrganizationMixin, LocalBusinessMixin, DentistMixin], { types: [schema.Dentist] }, env)
