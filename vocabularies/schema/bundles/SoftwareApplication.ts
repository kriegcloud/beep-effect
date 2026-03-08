import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { DataFeedMixin } from '../lib/DataFeed.js';
import { ImageObjectMixin } from '../lib/ImageObject.js';
import { SoftwareApplicationMixin } from '../lib/SoftwareApplication.js';

export const SoftwareApplicationBundle = [
  CreativeWorkMixin as Mixin,
  DataFeedMixin as Mixin,
  ImageObjectMixin as Mixin,
  SoftwareApplicationMixin as Mixin];
