import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { MedicalOrganizationMixin } from './MedicalOrganization.js';

export interface VeterinaryCare<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.MedicalOrganization<D>, rdfine.RdfResource<D> {
}

export function VeterinaryCareMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<VeterinaryCare & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class VeterinaryCareClass extends MedicalOrganizationMixin(Resource) {
  }
  return VeterinaryCareClass as any
}
VeterinaryCareMixin.appliesTo = schema.VeterinaryCare
VeterinaryCareMixin.createFactory = (env: RdfineEnvironment) => createFactory<VeterinaryCare>([MedicalOrganizationMixin, VeterinaryCareMixin], { types: [schema.VeterinaryCare] }, env)
