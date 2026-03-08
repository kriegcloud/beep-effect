import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ReservationMixin } from './Reservation.js';

export interface TrainReservation<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Reservation<D>, rdfine.RdfResource<D> {
}

export function TrainReservationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<TrainReservation & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class TrainReservationClass extends ReservationMixin(Resource) {
  }
  return TrainReservationClass as any
}
TrainReservationMixin.appliesTo = schema.TrainReservation
TrainReservationMixin.createFactory = (env: RdfineEnvironment) => createFactory<TrainReservation>([ReservationMixin, TrainReservationMixin], { types: [schema.TrainReservation] }, env)
