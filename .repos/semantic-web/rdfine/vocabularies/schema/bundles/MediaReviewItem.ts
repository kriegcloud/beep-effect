import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { MediaObjectMixin } from '../lib/MediaObject.js';
import { MediaReviewItemMixin } from '../lib/MediaReviewItem.js';

export const MediaReviewItemBundle = [
  CreativeWorkMixin as Mixin,
  MediaObjectMixin as Mixin,
  MediaReviewItemMixin as Mixin];
