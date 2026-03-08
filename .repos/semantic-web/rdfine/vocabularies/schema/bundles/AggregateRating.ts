import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AggregateRatingMixin } from '../lib/AggregateRating.js';
import { RatingMixin } from '../lib/Rating.js';
import { ThingMixin } from '../lib/Thing.js';

export const AggregateRatingBundle = [
  AggregateRatingMixin as Mixin,
  RatingMixin as Mixin,
  ThingMixin as Mixin];
