import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ActionAccessSpecificationMixin } from '../lib/ActionAccessSpecification.js';
import { CategoryCodeMixin } from '../lib/CategoryCode.js';
import { GeoShapeMixin } from '../lib/GeoShape.js';
import { IntangibleMixin } from '../lib/Intangible.js';
import { MediaSubscriptionMixin } from '../lib/MediaSubscription.js';
import { OfferMixin } from '../lib/Offer.js';
import { PlaceMixin } from '../lib/Place.js';
import { ThingMixin } from '../lib/Thing.js';

export const ActionAccessSpecificationBundle = [
  ActionAccessSpecificationMixin as Mixin,
  CategoryCodeMixin as Mixin,
  GeoShapeMixin as Mixin,
  IntangibleMixin as Mixin,
  MediaSubscriptionMixin as Mixin,
  OfferMixin as Mixin,
  PlaceMixin as Mixin,
  ThingMixin as Mixin];
