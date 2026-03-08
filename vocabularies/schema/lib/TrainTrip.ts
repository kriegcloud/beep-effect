import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { TripMixin } from './Trip.js';

export interface TrainTrip<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Trip<D>, rdfine.RdfResource<D> {
  arrivalPlatform: string | undefined;
  arrivalStation: Schema.TrainStation<D> | undefined;
  departurePlatform: string | undefined;
  departureStation: Schema.TrainStation<D> | undefined;
  trainName: string | undefined;
  trainNumber: string | undefined;
}

export function TrainTripMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<TrainTrip & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class TrainTripClass extends TripMixin(Resource) {
    @rdfine.property.literal()
    arrivalPlatform: string | undefined;
    @rdfine.property.resource()
    arrivalStation: Schema.TrainStation | undefined;
    @rdfine.property.literal()
    departurePlatform: string | undefined;
    @rdfine.property.resource()
    departureStation: Schema.TrainStation | undefined;
    @rdfine.property.literal()
    trainName: string | undefined;
    @rdfine.property.literal()
    trainNumber: string | undefined;
  }
  return TrainTripClass as any
}
TrainTripMixin.appliesTo = schema.TrainTrip
TrainTripMixin.createFactory = (env: RdfineEnvironment) => createFactory<TrainTrip>([TripMixin, TrainTripMixin], { types: [schema.TrainTrip] }, env)
