import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { ShortStoryMixin } from '../lib/ShortStory.js';

export const ShortStoryBundle = [
  CreativeWorkMixin as Mixin,
  ShortStoryMixin as Mixin];
