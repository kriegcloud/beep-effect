import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { EventMixin } from './Event.js';

export interface FoodEvent<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Event<D>, rdfine.RdfResource<D> {
}

export function FoodEventMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<FoodEvent & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class FoodEventClass extends EventMixin(Resource) {
  }
  return FoodEventClass as any
}
FoodEventMixin.appliesTo = schema.FoodEvent
FoodEventMixin.createFactory = (env: RdfineEnvironment) => createFactory<FoodEvent>([EventMixin, FoodEventMixin], { types: [schema.FoodEvent] }, env)
