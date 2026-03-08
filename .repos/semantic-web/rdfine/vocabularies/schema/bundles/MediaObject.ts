import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ClaimMixin } from '../lib/Claim.js';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { DistanceMixin } from '../lib/Distance.js';
import { DurationMixin } from '../lib/Duration.js';
import { GeoShapeMixin } from '../lib/GeoShape.js';
import { MediaObjectMixin } from '../lib/MediaObject.js';
import { MediaSubscriptionMixin } from '../lib/MediaSubscription.js';
import { NewsArticleMixin } from '../lib/NewsArticle.js';
import { OrganizationMixin } from '../lib/Organization.js';
import { PlaceMixin } from '../lib/Place.js';
import { QuantitativeValueMixin } from '../lib/QuantitativeValue.js';

export const MediaObjectBundle = [
  ClaimMixin as Mixin,
  CreativeWorkMixin as Mixin,
  DistanceMixin as Mixin,
  DurationMixin as Mixin,
  GeoShapeMixin as Mixin,
  MediaObjectMixin as Mixin,
  MediaSubscriptionMixin as Mixin,
  NewsArticleMixin as Mixin,
  OrganizationMixin as Mixin,
  PlaceMixin as Mixin,
  QuantitativeValueMixin as Mixin];
