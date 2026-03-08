import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AggregateRatingMixin } from '../lib/AggregateRating.js';
import { BrandMixin } from '../lib/Brand.js';
import { ImageObjectMixin } from '../lib/ImageObject.js';
import { IntangibleMixin } from '../lib/Intangible.js';
import { ReviewMixin } from '../lib/Review.js';

export const BrandBundle = [
  AggregateRatingMixin as Mixin,
  BrandMixin as Mixin,
  ImageObjectMixin as Mixin,
  IntangibleMixin as Mixin,
  ReviewMixin as Mixin];
