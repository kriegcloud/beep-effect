import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ReservationMixin } from './Reservation.js';

export interface EventReservation<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Reservation<D>, rdfine.RdfResource<D> {
}

export function EventReservationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<EventReservation & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class EventReservationClass extends ReservationMixin(Resource) {
  }
  return EventReservationClass as any
}
EventReservationMixin.appliesTo = schema.EventReservation
EventReservationMixin.createFactory = (env: RdfineEnvironment) => createFactory<EventReservation>([ReservationMixin, EventReservationMixin], { types: [schema.EventReservation] }, env)
