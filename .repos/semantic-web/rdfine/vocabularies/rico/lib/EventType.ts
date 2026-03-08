import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { TypeMixin } from './Type.js';

export interface EventType<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.Type<D>, rdfine.RdfResource<D> {
  isEventTypeOf: Rico.Event<D> | undefined;
}

export function EventTypeMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<EventType & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class EventTypeClass extends TypeMixin(Resource) {
    @rdfine.property.resource({ implicitTypes: [rico.Event] })
    isEventTypeOf: Rico.Event | undefined;
  }
  return EventTypeClass as any
}
EventTypeMixin.appliesTo = rico.EventType
EventTypeMixin.createFactory = (env: RdfineEnvironment) => createFactory<EventType>([TypeMixin, EventTypeMixin], { types: [rico.EventType] }, env)
