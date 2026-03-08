import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { RoleMixin } from './Role.js';

export interface OrganizationRole<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Role<D>, rdfine.RdfResource<D> {
  numberedPosition: number | undefined;
}

export function OrganizationRoleMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<OrganizationRole & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class OrganizationRoleClass extends RoleMixin(Resource) {
    @rdfine.property.literal({ type: Number })
    numberedPosition: number | undefined;
  }
  return OrganizationRoleClass as any
}
OrganizationRoleMixin.appliesTo = schema.OrganizationRole
OrganizationRoleMixin.createFactory = (env: RdfineEnvironment) => createFactory<OrganizationRole>([RoleMixin, OrganizationRoleMixin], { types: [schema.OrganizationRole] }, env)
