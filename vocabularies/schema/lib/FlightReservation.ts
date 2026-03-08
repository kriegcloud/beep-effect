import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ReservationMixin } from './Reservation.js';

export interface FlightReservation<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Reservation<D>, rdfine.RdfResource<D> {
  boardingGroup: string | undefined;
  passengerPriorityStatus: string | undefined;
  passengerPriorityStatusTerm: Schema.QualitativeValue | undefined;
  passengerSequenceNumber: string | undefined;
  securityScreening: string | undefined;
}

export function FlightReservationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<FlightReservation & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class FlightReservationClass extends ReservationMixin(Resource) {
    @rdfine.property.literal()
    boardingGroup: string | undefined;
    @rdfine.property.literal()
    passengerPriorityStatus: string | undefined;
    @rdfine.property({ path: schema.passengerPriorityStatus })
    passengerPriorityStatusTerm: Schema.QualitativeValue | undefined;
    @rdfine.property.literal()
    passengerSequenceNumber: string | undefined;
    @rdfine.property.literal()
    securityScreening: string | undefined;
  }
  return FlightReservationClass as any
}
FlightReservationMixin.appliesTo = schema.FlightReservation
FlightReservationMixin.createFactory = (env: RdfineEnvironment) => createFactory<FlightReservation>([ReservationMixin, FlightReservationMixin], { types: [schema.FlightReservation] }, env)
