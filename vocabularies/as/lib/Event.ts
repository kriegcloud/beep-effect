import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { as } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as As from '../index.js';
import { ObjectMixin } from './Object.js';

export interface Event<D extends RDF.DatasetCore = RDF.DatasetCore> extends As.Object<D>, rdfine.RdfResource<D> {
}

export function EventMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Event & RdfResourceCore> & Base {
  @rdfine.namespace(as)
  class EventClass extends ObjectMixin(Resource) {
  }
  return EventClass as any
}
EventMixin.appliesTo = as.Event
EventMixin.createFactory = (env: RdfineEnvironment) => createFactory<Event>([ObjectMixin, EventMixin], { types: [as.Event] }, env)
