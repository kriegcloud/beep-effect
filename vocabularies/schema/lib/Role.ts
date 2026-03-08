import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { IntangibleMixin } from './Intangible.js';

export interface Role<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Intangible<D>, rdfine.RdfResource<D> {
  endDate: Date | undefined;
  namedPosition: string | undefined;
  namedPositionTerm: RDF.NamedNode | undefined;
  roleName: string | undefined;
  roleNameTerm: RDF.NamedNode | undefined;
  startDate: Date | undefined;
}

export function RoleMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Role & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class RoleClass extends IntangibleMixin(Resource) {
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#date') })
    endDate: Date | undefined;
    @rdfine.property.literal()
    namedPosition: string | undefined;
    @rdfine.property({ path: schema.namedPosition })
    namedPositionTerm: RDF.NamedNode | undefined;
    @rdfine.property.literal()
    roleName: string | undefined;
    @rdfine.property({ path: schema.roleName })
    roleNameTerm: RDF.NamedNode | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#date') })
    startDate: Date | undefined;
  }
  return RoleClass as any
}
RoleMixin.appliesTo = schema.Role
RoleMixin.createFactory = (env: RdfineEnvironment) => createFactory<Role>([IntangibleMixin, RoleMixin], { types: [schema.Role] }, env)
