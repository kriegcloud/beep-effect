import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { PlaceMixin } from './Place.js';

export interface Accommodation<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Place<D>, rdfine.RdfResource<D> {
  accommodationCategory: string | undefined;
  accommodationFloorPlan: Schema.FloorPlan<D> | undefined;
  amenityFeature: Schema.LocationFeatureSpecification<D> | undefined;
  floorLevel: string | undefined;
  floorSize: Schema.QuantitativeValue<D> | undefined;
  leaseLength: Schema.Duration<D> | Schema.QuantitativeValue<D> | undefined;
  numberOfBathroomsTotal: number | undefined;
  numberOfBedrooms: Schema.QuantitativeValue<D> | undefined;
  numberOfBedroomsLiteral: number | undefined;
  numberOfFullBathrooms: number | undefined;
  numberOfPartialBathrooms: number | undefined;
  numberOfRooms: Schema.QuantitativeValue<D> | undefined;
  numberOfRoomsLiteral: number | undefined;
  permittedUsage: string | undefined;
  petsAllowed: boolean | string | undefined;
  tourBookingPage: RDF.NamedNode | undefined;
  yearBuilt: number | undefined;
}

export function AccommodationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Accommodation & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class AccommodationClass extends PlaceMixin(Resource) {
    @rdfine.property.literal()
    accommodationCategory: string | undefined;
    @rdfine.property.resource()
    accommodationFloorPlan: Schema.FloorPlan | undefined;
    @rdfine.property.resource()
    amenityFeature: Schema.LocationFeatureSpecification | undefined;
    @rdfine.property.literal()
    floorLevel: string | undefined;
    @rdfine.property.resource()
    floorSize: Schema.QuantitativeValue | undefined;
    @rdfine.property.resource()
    leaseLength: Schema.Duration | Schema.QuantitativeValue | undefined;
    @rdfine.property.literal({ type: Number })
    numberOfBathroomsTotal: number | undefined;
    @rdfine.property.resource()
    numberOfBedrooms: Schema.QuantitativeValue | undefined;
    @rdfine.property.literal({ path: schema.numberOfBedrooms, type: Number })
    numberOfBedroomsLiteral: number | undefined;
    @rdfine.property.literal({ type: Number })
    numberOfFullBathrooms: number | undefined;
    @rdfine.property.literal({ type: Number })
    numberOfPartialBathrooms: number | undefined;
    @rdfine.property.resource()
    numberOfRooms: Schema.QuantitativeValue | undefined;
    @rdfine.property.literal({ path: schema.numberOfRooms, type: Number })
    numberOfRoomsLiteral: number | undefined;
    @rdfine.property.literal()
    permittedUsage: string | undefined;
    @rdfine.property.literal()
    petsAllowed: boolean | string | undefined;
    @rdfine.property()
    tourBookingPage: RDF.NamedNode | undefined;
    @rdfine.property.literal({ type: Number })
    yearBuilt: number | undefined;
  }
  return AccommodationClass as any
}
AccommodationMixin.appliesTo = schema.Accommodation
AccommodationMixin.createFactory = (env: RdfineEnvironment) => createFactory<Accommodation>([PlaceMixin, AccommodationMixin], { types: [schema.Accommodation] }, env)
