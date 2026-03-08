import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { TripMixin } from './Trip.js';

export interface BusTrip<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Trip<D>, rdfine.RdfResource<D> {
  arrivalBusStop: Schema.BusStation<D> | Schema.BusStop<D> | undefined;
  busName: string | undefined;
  busNumber: string | undefined;
  departureBusStop: Schema.BusStation<D> | Schema.BusStop<D> | undefined;
}

export function BusTripMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<BusTrip & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class BusTripClass extends TripMixin(Resource) {
    @rdfine.property.resource()
    arrivalBusStop: Schema.BusStation | Schema.BusStop | undefined;
    @rdfine.property.literal()
    busName: string | undefined;
    @rdfine.property.literal()
    busNumber: string | undefined;
    @rdfine.property.resource()
    departureBusStop: Schema.BusStation | Schema.BusStop | undefined;
  }
  return BusTripClass as any
}
BusTripMixin.appliesTo = schema.BusTrip
BusTripMixin.createFactory = (env: RdfineEnvironment) => createFactory<BusTrip>([TripMixin, BusTripMixin], { types: [schema.BusTrip] }, env)
