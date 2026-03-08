import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { EndorsementRatingMixin } from '../lib/EndorsementRating.js';
import { RatingMixin } from '../lib/Rating.js';

export const EndorsementRatingBundle = [
  EndorsementRatingMixin as Mixin,
  RatingMixin as Mixin];
