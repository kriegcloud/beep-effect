import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { RelationMixin } from './Relation.js';

export interface AuthorityRelation<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.Relation<D>, rdfine.RdfResource<D> {
  'authorityRelation_role': Rico.AuthorityRelation<D> | undefined;
}

export function AuthorityRelationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<AuthorityRelation & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class AuthorityRelationClass extends RelationMixin(Resource) {
    @rdfine.property.resource({ as: [AuthorityRelationMixin] })
    'authorityRelation_role': Rico.AuthorityRelation | undefined;
  }
  return AuthorityRelationClass as any
}
AuthorityRelationMixin.appliesTo = rico.AuthorityRelation
AuthorityRelationMixin.createFactory = (env: RdfineEnvironment) => createFactory<AuthorityRelation>([RelationMixin, AuthorityRelationMixin], { types: [rico.AuthorityRelation] }, env)
