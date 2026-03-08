import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { TripMixin } from './Trip.js';

export interface BoatTrip<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Trip<D>, rdfine.RdfResource<D> {
  arrivalBoatTerminal: Schema.BoatTerminal<D> | undefined;
  departureBoatTerminal: Schema.BoatTerminal<D> | undefined;
}

export function BoatTripMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<BoatTrip & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class BoatTripClass extends TripMixin(Resource) {
    @rdfine.property.resource()
    arrivalBoatTerminal: Schema.BoatTerminal | undefined;
    @rdfine.property.resource()
    departureBoatTerminal: Schema.BoatTerminal | undefined;
  }
  return BoatTripClass as any
}
BoatTripMixin.appliesTo = schema.BoatTrip
BoatTripMixin.createFactory = (env: RdfineEnvironment) => createFactory<BoatTrip>([TripMixin, BoatTripMixin], { types: [schema.BoatTrip] }, env)
