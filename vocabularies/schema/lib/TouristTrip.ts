import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { TripMixin } from './Trip.js';

export interface TouristTrip<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Trip<D>, rdfine.RdfResource<D> {
  touristType: Schema.Audience<D> | undefined;
  touristTypeLiteral: string | undefined;
}

export function TouristTripMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<TouristTrip & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class TouristTripClass extends TripMixin(Resource) {
    @rdfine.property.resource()
    touristType: Schema.Audience | undefined;
    @rdfine.property.literal({ path: schema.touristType })
    touristTypeLiteral: string | undefined;
  }
  return TouristTripClass as any
}
TouristTripMixin.appliesTo = schema.TouristTrip
TouristTripMixin.createFactory = (env: RdfineEnvironment) => createFactory<TouristTrip>([TripMixin, TouristTripMixin], { types: [schema.TouristTrip] }, env)
