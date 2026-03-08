import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ReservationMixin } from './Reservation.js';

export interface BusReservation<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Reservation<D>, rdfine.RdfResource<D> {
}

export function BusReservationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<BusReservation & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class BusReservationClass extends ReservationMixin(Resource) {
  }
  return BusReservationClass as any
}
BusReservationMixin.appliesTo = schema.BusReservation
BusReservationMixin.createFactory = (env: RdfineEnvironment) => createFactory<BusReservation>([ReservationMixin, BusReservationMixin], { types: [schema.BusReservation] }, env)
