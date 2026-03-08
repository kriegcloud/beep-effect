import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { OrganizationMixin } from './Organization.js';

export interface GovernmentOrganization<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Organization<D>, rdfine.RdfResource<D> {
}

export function GovernmentOrganizationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<GovernmentOrganization & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class GovernmentOrganizationClass extends OrganizationMixin(Resource) {
  }
  return GovernmentOrganizationClass as any
}
GovernmentOrganizationMixin.appliesTo = schema.GovernmentOrganization
GovernmentOrganizationMixin.createFactory = (env: RdfineEnvironment) => createFactory<GovernmentOrganization>([OrganizationMixin, GovernmentOrganizationMixin], { types: [schema.GovernmentOrganization] }, env)
