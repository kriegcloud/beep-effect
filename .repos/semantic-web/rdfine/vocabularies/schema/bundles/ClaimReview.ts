import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ClaimReviewMixin } from '../lib/ClaimReview.js';
import { ReviewMixin } from '../lib/Review.js';

export const ClaimReviewBundle = [
  ClaimReviewMixin as Mixin,
  ReviewMixin as Mixin];
