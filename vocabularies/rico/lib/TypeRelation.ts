import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { RelationMixin } from './Relation.js';

export interface TypeRelation<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.Relation<D>, rdfine.RdfResource<D> {
  'typeRelation_role': Rico.TypeRelation<D> | undefined;
}

export function TypeRelationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<TypeRelation & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class TypeRelationClass extends RelationMixin(Resource) {
    @rdfine.property.resource({ as: [TypeRelationMixin] })
    'typeRelation_role': Rico.TypeRelation | undefined;
  }
  return TypeRelationClass as any
}
TypeRelationMixin.appliesTo = rico.TypeRelation
TypeRelationMixin.createFactory = (env: RdfineEnvironment) => createFactory<TypeRelation>([RelationMixin, TypeRelationMixin], { types: [rico.TypeRelation] }, env)
