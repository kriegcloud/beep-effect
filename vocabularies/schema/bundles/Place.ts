import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AggregateRatingMixin } from '../lib/AggregateRating.js';
import { EventMixin } from '../lib/Event.js';
import { GeoCoordinatesMixin } from '../lib/GeoCoordinates.js';
import { GeoShapeMixin } from '../lib/GeoShape.js';
import { ImageObjectMixin } from '../lib/ImageObject.js';
import { LocationFeatureSpecificationMixin } from '../lib/LocationFeatureSpecification.js';
import { MapMixin } from '../lib/Map.js';
import { OpeningHoursSpecificationMixin } from '../lib/OpeningHoursSpecification.js';
import { PhotographMixin } from '../lib/Photograph.js';
import { PlaceMixin } from '../lib/Place.js';
import { PostalAddressMixin } from '../lib/PostalAddress.js';
import { PropertyValueMixin } from '../lib/PropertyValue.js';
import { ReviewMixin } from '../lib/Review.js';
import { ThingMixin } from '../lib/Thing.js';

export const PlaceBundle = [
  AggregateRatingMixin as Mixin,
  EventMixin as Mixin,
  GeoCoordinatesMixin as Mixin,
  GeoShapeMixin as Mixin,
  ImageObjectMixin as Mixin,
  LocationFeatureSpecificationMixin as Mixin,
  MapMixin as Mixin,
  OpeningHoursSpecificationMixin as Mixin,
  PhotographMixin as Mixin,
  PlaceMixin as Mixin,
  PostalAddressMixin as Mixin,
  PropertyValueMixin as Mixin,
  ReviewMixin as Mixin,
  ThingMixin as Mixin];
