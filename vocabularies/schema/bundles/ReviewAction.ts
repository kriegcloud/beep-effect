import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AssessActionMixin } from '../lib/AssessAction.js';
import { ReviewActionMixin } from '../lib/ReviewAction.js';
import { ReviewMixin } from '../lib/Review.js';

export const ReviewActionBundle = [
  AssessActionMixin as Mixin,
  ReviewActionMixin as Mixin,
  ReviewMixin as Mixin];
