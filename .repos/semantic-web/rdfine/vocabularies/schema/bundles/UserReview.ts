import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ReviewMixin } from '../lib/Review.js';
import { UserReviewMixin } from '../lib/UserReview.js';

export const UserReviewBundle = [
  ReviewMixin as Mixin,
  UserReviewMixin as Mixin];
