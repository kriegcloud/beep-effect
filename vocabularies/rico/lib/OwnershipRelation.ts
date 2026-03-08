import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { AuthorityRelationMixin } from './AuthorityRelation.js';

export interface OwnershipRelation<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.AuthorityRelation<D>, rdfine.RdfResource<D> {
  'ownershipRelation_role': Rico.OwnershipRelation<D> | undefined;
}

export function OwnershipRelationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<OwnershipRelation & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class OwnershipRelationClass extends AuthorityRelationMixin(Resource) {
    @rdfine.property.resource({ as: [OwnershipRelationMixin] })
    'ownershipRelation_role': Rico.OwnershipRelation | undefined;
  }
  return OwnershipRelationClass as any
}
OwnershipRelationMixin.appliesTo = rico.OwnershipRelation
OwnershipRelationMixin.createFactory = (env: RdfineEnvironment) => createFactory<OwnershipRelation>([AuthorityRelationMixin, OwnershipRelationMixin], { types: [rico.OwnershipRelation] }, env)
