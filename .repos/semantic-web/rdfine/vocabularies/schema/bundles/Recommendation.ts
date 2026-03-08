import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CategoryCodeMixin } from '../lib/CategoryCode.js';
import { RecommendationMixin } from '../lib/Recommendation.js';
import { ReviewMixin } from '../lib/Review.js';
import { ThingMixin } from '../lib/Thing.js';

export const RecommendationBundle = [
  CategoryCodeMixin as Mixin,
  RecommendationMixin as Mixin,
  ReviewMixin as Mixin,
  ThingMixin as Mixin];
