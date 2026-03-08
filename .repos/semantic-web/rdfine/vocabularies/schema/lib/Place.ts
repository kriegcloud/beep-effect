import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ThingMixin } from './Thing.js';

export interface Place<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Thing<D>, rdfine.RdfResource<D> {
  additionalProperty: Schema.PropertyValue<D> | undefined;
  address: Schema.PostalAddress<D> | undefined;
  addressLiteral: string | undefined;
  aggregateRating: Schema.AggregateRating<D> | undefined;
  amenityFeature: Schema.LocationFeatureSpecification<D> | undefined;
  branchCode: string | undefined;
  containedIn: Schema.Place<D> | undefined;
  containedInPlace: Schema.Place<D> | undefined;
  containsPlace: Schema.Place<D> | undefined;
  event: Schema.Event<D> | undefined;
  events: Schema.Event<D> | undefined;
  faxNumber: string | undefined;
  geo: Schema.GeoCoordinates<D> | Schema.GeoShape<D> | undefined;
  geoContains: Schema.Place<D> | undefined;
  geoCoveredBy: Schema.Place<D> | undefined;
  geoCovers: Schema.Place<D> | undefined;
  geoCrosses: Schema.Place<D> | undefined;
  geoDisjoint: Schema.Place<D> | undefined;
  geoEquals: Schema.Place<D> | undefined;
  geoIntersects: Schema.Place<D> | undefined;
  geoOverlaps: Schema.Place<D> | undefined;
  geoTouches: Schema.Place<D> | undefined;
  geoWithin: Schema.Place<D> | undefined;
  globalLocationNumber: string | undefined;
  hasDriveThroughService: boolean | undefined;
  hasMap: Schema.Map<D> | undefined;
  isAccessibleForFree: boolean | undefined;
  'isicV4': string | undefined;
  keywords: string | undefined;
  keywordsTerm: RDF.NamedNode | undefined;
  latitude: number | string | undefined;
  logo: Schema.ImageObject<D> | undefined;
  longitude: number | string | undefined;
  map: RDF.NamedNode | undefined;
  maps: RDF.NamedNode | undefined;
  maximumAttendeeCapacity: number | undefined;
  openingHoursSpecification: Schema.OpeningHoursSpecification<D> | undefined;
  photo: Schema.ImageObject<D> | Schema.Photograph<D> | undefined;
  photos: Schema.ImageObject<D> | Schema.Photograph<D> | undefined;
  publicAccess: boolean | undefined;
  review: Schema.Review<D> | undefined;
  reviews: Schema.Review<D> | undefined;
  slogan: string | undefined;
  smokingAllowed: boolean | undefined;
  specialOpeningHoursSpecification: Schema.OpeningHoursSpecification<D> | undefined;
  telephone: string | undefined;
  tourBookingPage: RDF.NamedNode | undefined;
}

export function PlaceMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Place & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class PlaceClass extends ThingMixin(Resource) {
    @rdfine.property.resource()
    additionalProperty: Schema.PropertyValue | undefined;
    @rdfine.property.resource()
    address: Schema.PostalAddress | undefined;
    @rdfine.property.literal({ path: schema.address })
    addressLiteral: string | undefined;
    @rdfine.property.resource()
    aggregateRating: Schema.AggregateRating | undefined;
    @rdfine.property.resource()
    amenityFeature: Schema.LocationFeatureSpecification | undefined;
    @rdfine.property.literal()
    branchCode: string | undefined;
    @rdfine.property.resource()
    containedIn: Schema.Place | undefined;
    @rdfine.property.resource()
    containedInPlace: Schema.Place | undefined;
    @rdfine.property.resource()
    containsPlace: Schema.Place | undefined;
    @rdfine.property.resource()
    event: Schema.Event | undefined;
    @rdfine.property.resource()
    events: Schema.Event | undefined;
    @rdfine.property.literal()
    faxNumber: string | undefined;
    @rdfine.property.resource()
    geo: Schema.GeoCoordinates | Schema.GeoShape | undefined;
    @rdfine.property.resource()
    geoContains: Schema.Place | undefined;
    @rdfine.property.resource()
    geoCoveredBy: Schema.Place | undefined;
    @rdfine.property.resource()
    geoCovers: Schema.Place | undefined;
    @rdfine.property.resource()
    geoCrosses: Schema.Place | undefined;
    @rdfine.property.resource()
    geoDisjoint: Schema.Place | undefined;
    @rdfine.property.resource()
    geoEquals: Schema.Place | undefined;
    @rdfine.property.resource()
    geoIntersects: Schema.Place | undefined;
    @rdfine.property.resource()
    geoOverlaps: Schema.Place | undefined;
    @rdfine.property.resource()
    geoTouches: Schema.Place | undefined;
    @rdfine.property.resource()
    geoWithin: Schema.Place | undefined;
    @rdfine.property.literal()
    globalLocationNumber: string | undefined;
    @rdfine.property.literal({ type: Boolean })
    hasDriveThroughService: boolean | undefined;
    @rdfine.property.resource()
    hasMap: Schema.Map | undefined;
    @rdfine.property.literal({ type: Boolean })
    isAccessibleForFree: boolean | undefined;
    @rdfine.property.literal()
    'isicV4': string | undefined;
    @rdfine.property.literal()
    keywords: string | undefined;
    @rdfine.property({ path: schema.keywords })
    keywordsTerm: RDF.NamedNode | undefined;
    @rdfine.property.literal()
    latitude: number | string | undefined;
    @rdfine.property.resource()
    logo: Schema.ImageObject | undefined;
    @rdfine.property.literal()
    longitude: number | string | undefined;
    @rdfine.property()
    map: RDF.NamedNode | undefined;
    @rdfine.property()
    maps: RDF.NamedNode | undefined;
    @rdfine.property.literal({ type: Number })
    maximumAttendeeCapacity: number | undefined;
    @rdfine.property.resource()
    openingHoursSpecification: Schema.OpeningHoursSpecification | undefined;
    @rdfine.property.resource()
    photo: Schema.ImageObject | Schema.Photograph | undefined;
    @rdfine.property.resource()
    photos: Schema.ImageObject | Schema.Photograph | undefined;
    @rdfine.property.literal({ type: Boolean })
    publicAccess: boolean | undefined;
    @rdfine.property.resource()
    review: Schema.Review | undefined;
    @rdfine.property.resource()
    reviews: Schema.Review | undefined;
    @rdfine.property.literal()
    slogan: string | undefined;
    @rdfine.property.literal({ type: Boolean })
    smokingAllowed: boolean | undefined;
    @rdfine.property.resource()
    specialOpeningHoursSpecification: Schema.OpeningHoursSpecification | undefined;
    @rdfine.property.literal()
    telephone: string | undefined;
    @rdfine.property()
    tourBookingPage: RDF.NamedNode | undefined;
  }
  return PlaceClass as any
}
PlaceMixin.appliesTo = schema.Place
PlaceMixin.createFactory = (env: RdfineEnvironment) => createFactory<Place>([ThingMixin, PlaceMixin], { types: [schema.Place] }, env)
