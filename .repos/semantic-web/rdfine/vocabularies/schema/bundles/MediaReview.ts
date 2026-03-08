import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { MediaObjectMixin } from '../lib/MediaObject.js';
import { MediaReviewMixin } from '../lib/MediaReview.js';
import { ReviewMixin } from '../lib/Review.js';
import { WebPageMixin } from '../lib/WebPage.js';

export const MediaReviewBundle = [
  MediaObjectMixin as Mixin,
  MediaReviewMixin as Mixin,
  ReviewMixin as Mixin,
  WebPageMixin as Mixin];
