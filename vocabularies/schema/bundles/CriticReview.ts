import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CriticReviewMixin } from '../lib/CriticReview.js';
import { ReviewMixin } from '../lib/Review.js';

export const CriticReviewBundle = [
  CriticReviewMixin as Mixin,
  ReviewMixin as Mixin];
