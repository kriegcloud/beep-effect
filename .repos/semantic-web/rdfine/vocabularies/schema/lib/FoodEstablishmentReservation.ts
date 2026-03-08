import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ReservationMixin } from './Reservation.js';

export interface FoodEstablishmentReservation<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Reservation<D>, rdfine.RdfResource<D> {
  endTime: Date | undefined;
  partySize: Schema.QuantitativeValue<D> | undefined;
  partySizeLiteral: number | undefined;
  startTime: Date | undefined;
}

export function FoodEstablishmentReservationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<FoodEstablishmentReservation & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class FoodEstablishmentReservationClass extends ReservationMixin(Resource) {
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#time') })
    endTime: Date | undefined;
    @rdfine.property.resource()
    partySize: Schema.QuantitativeValue | undefined;
    @rdfine.property.literal({ path: schema.partySize, type: Number })
    partySizeLiteral: number | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#time') })
    startTime: Date | undefined;
  }
  return FoodEstablishmentReservationClass as any
}
FoodEstablishmentReservationMixin.appliesTo = schema.FoodEstablishmentReservation
FoodEstablishmentReservationMixin.createFactory = (env: RdfineEnvironment) => createFactory<FoodEstablishmentReservation>([ReservationMixin, FoodEstablishmentReservationMixin], { types: [schema.FoodEstablishmentReservation] }, env)
