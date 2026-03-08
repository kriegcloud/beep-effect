import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { RelationMixin } from './Relation.js';

export interface PlaceRelation<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.Relation<D>, rdfine.RdfResource<D> {
  'placeRelation_role': Rico.PlaceRelation<D> | undefined;
}

export function PlaceRelationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<PlaceRelation & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class PlaceRelationClass extends RelationMixin(Resource) {
    @rdfine.property.resource({ as: [PlaceRelationMixin] })
    'placeRelation_role': Rico.PlaceRelation | undefined;
  }
  return PlaceRelationClass as any
}
PlaceRelationMixin.appliesTo = rico.PlaceRelation
PlaceRelationMixin.createFactory = (env: RdfineEnvironment) => createFactory<PlaceRelation>([RelationMixin, PlaceRelationMixin], { types: [rico.PlaceRelation] }, env)
