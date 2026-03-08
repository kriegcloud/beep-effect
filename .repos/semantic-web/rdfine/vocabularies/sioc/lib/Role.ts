import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { sioc } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Sioc from '../index.js';

export interface Role<D extends RDF.DatasetCore = RDF.DatasetCore> extends rdfine.RdfResource<D> {
  'function_of': RDF.Term | undefined;
  'has_scope': RDF.Term | undefined;
}

export function RoleMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Role & RdfResourceCore> & Base {
  @rdfine.namespace(sioc)
  class RoleClass extends Resource {
    @rdfine.property()
    'function_of': RDF.Term | undefined;
    @rdfine.property()
    'has_scope': RDF.Term | undefined;
  }
  return RoleClass as any
}
RoleMixin.appliesTo = sioc.Role
RoleMixin.createFactory = (env: RdfineEnvironment) => createFactory<Role>([RoleMixin], { types: [sioc.Role] }, env)
