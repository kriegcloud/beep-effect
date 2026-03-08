import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { IntangibleMixin } from './Intangible.js';

export interface Trip<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Intangible<D>, rdfine.RdfResource<D> {
  arrivalTime: Date | undefined;
  departureTime: Date | undefined;
  itinerary: Schema.ItemList<D> | Schema.Place<D> | undefined;
  offers: Schema.Demand<D> | Schema.Offer<D> | undefined;
  partOfTrip: Schema.Trip<D> | undefined;
  provider: Schema.Organization<D> | Schema.Person<D> | undefined;
  subTrip: Schema.Trip<D> | undefined;
}

export function TripMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Trip & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class TripClass extends IntangibleMixin(Resource) {
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#time') })
    arrivalTime: Date | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#time') })
    departureTime: Date | undefined;
    @rdfine.property.resource()
    itinerary: Schema.ItemList | Schema.Place | undefined;
    @rdfine.property.resource()
    offers: Schema.Demand | Schema.Offer | undefined;
    @rdfine.property.resource()
    partOfTrip: Schema.Trip | undefined;
    @rdfine.property.resource()
    provider: Schema.Organization | Schema.Person | undefined;
    @rdfine.property.resource()
    subTrip: Schema.Trip | undefined;
  }
  return TripClass as any
}
TripMixin.appliesTo = schema.Trip
TripMixin.createFactory = (env: RdfineEnvironment) => createFactory<Trip>([IntangibleMixin, TripMixin], { types: [schema.Trip] }, env)
