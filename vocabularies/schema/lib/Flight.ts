import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { TripMixin } from './Trip.js';

export interface Flight<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Trip<D>, rdfine.RdfResource<D> {
  aircraft: Schema.Vehicle<D> | undefined;
  aircraftLiteral: string | undefined;
  arrivalAirport: Schema.Airport<D> | undefined;
  arrivalGate: string | undefined;
  arrivalTerminal: string | undefined;
  boardingPolicy: Schema.BoardingPolicyType | undefined;
  carrier: Schema.Organization<D> | undefined;
  departureAirport: Schema.Airport<D> | undefined;
  departureGate: string | undefined;
  departureTerminal: string | undefined;
  estimatedFlightDuration: Schema.Duration<D> | undefined;
  estimatedFlightDurationLiteral: string | undefined;
  flightDistance: Schema.Distance<D> | undefined;
  flightDistanceLiteral: string | undefined;
  flightNumber: string | undefined;
  mealService: string | undefined;
  seller: Schema.Organization<D> | Schema.Person<D> | undefined;
  webCheckinTime: Date | undefined;
}

export function FlightMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Flight & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class FlightClass extends TripMixin(Resource) {
    @rdfine.property.resource()
    aircraft: Schema.Vehicle | undefined;
    @rdfine.property.literal({ path: schema.aircraft })
    aircraftLiteral: string | undefined;
    @rdfine.property.resource()
    arrivalAirport: Schema.Airport | undefined;
    @rdfine.property.literal()
    arrivalGate: string | undefined;
    @rdfine.property.literal()
    arrivalTerminal: string | undefined;
    @rdfine.property()
    boardingPolicy: Schema.BoardingPolicyType | undefined;
    @rdfine.property.resource()
    carrier: Schema.Organization | undefined;
    @rdfine.property.resource()
    departureAirport: Schema.Airport | undefined;
    @rdfine.property.literal()
    departureGate: string | undefined;
    @rdfine.property.literal()
    departureTerminal: string | undefined;
    @rdfine.property.resource()
    estimatedFlightDuration: Schema.Duration | undefined;
    @rdfine.property.literal({ path: schema.estimatedFlightDuration })
    estimatedFlightDurationLiteral: string | undefined;
    @rdfine.property.resource()
    flightDistance: Schema.Distance | undefined;
    @rdfine.property.literal({ path: schema.flightDistance })
    flightDistanceLiteral: string | undefined;
    @rdfine.property.literal()
    flightNumber: string | undefined;
    @rdfine.property.literal()
    mealService: string | undefined;
    @rdfine.property.resource()
    seller: Schema.Organization | Schema.Person | undefined;
    @rdfine.property.literal({ type: Date })
    webCheckinTime: Date | undefined;
  }
  return FlightClass as any
}
FlightMixin.appliesTo = schema.Flight
FlightMixin.createFactory = (env: RdfineEnvironment) => createFactory<Flight>([TripMixin, FlightMixin], { types: [schema.Flight] }, env)
