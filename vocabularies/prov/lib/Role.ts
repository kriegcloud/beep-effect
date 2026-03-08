import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { prov } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Prov from '../index.js';

export interface Role<D extends RDF.DatasetCore = RDF.DatasetCore> extends rdfine.RdfResource<D> {
}

export function RoleMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Role & RdfResourceCore> & Base {
  @rdfine.namespace(prov)
  class RoleClass extends Resource {
  }
  return RoleClass as any
}
RoleMixin.appliesTo = prov.Role
RoleMixin.createFactory = (env: RdfineEnvironment) => createFactory<Role>([RoleMixin], { types: [prov.Role] }, env)
