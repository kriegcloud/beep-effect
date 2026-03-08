import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { EmployerReviewMixin } from '../lib/EmployerReview.js';
import { ReviewMixin } from '../lib/Review.js';

export const EmployerReviewBundle = [
  EmployerReviewMixin as Mixin,
  ReviewMixin as Mixin];
