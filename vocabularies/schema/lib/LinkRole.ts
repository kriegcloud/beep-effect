import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { RoleMixin } from './Role.js';

export interface LinkRole<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Role<D>, rdfine.RdfResource<D> {
  inLanguage: Schema.Language<D> | undefined;
  inLanguageLiteral: string | undefined;
  linkRelationship: string | undefined;
}

export function LinkRoleMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<LinkRole & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class LinkRoleClass extends RoleMixin(Resource) {
    @rdfine.property.resource()
    inLanguage: Schema.Language | undefined;
    @rdfine.property.literal({ path: schema.inLanguage })
    inLanguageLiteral: string | undefined;
    @rdfine.property.literal()
    linkRelationship: string | undefined;
  }
  return LinkRoleClass as any
}
LinkRoleMixin.appliesTo = schema.LinkRole
LinkRoleMixin.createFactory = (env: RdfineEnvironment) => createFactory<LinkRole>([RoleMixin, LinkRoleMixin], { types: [schema.LinkRole] }, env)
