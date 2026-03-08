import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { RelationMixin } from './Relation.js';

export interface EventRelation<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.Relation<D>, rdfine.RdfResource<D> {
  'eventRelation_role': Rico.EventRelation<D> | undefined;
}

export function EventRelationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<EventRelation & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class EventRelationClass extends RelationMixin(Resource) {
    @rdfine.property.resource({ as: [EventRelationMixin] })
    'eventRelation_role': Rico.EventRelation | undefined;
  }
  return EventRelationClass as any
}
EventRelationMixin.appliesTo = rico.EventRelation
EventRelationMixin.createFactory = (env: RdfineEnvironment) => createFactory<EventRelation>([RelationMixin, EventRelationMixin], { types: [rico.EventRelation] }, env)
