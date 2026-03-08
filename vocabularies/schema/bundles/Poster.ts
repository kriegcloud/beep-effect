import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { PosterMixin } from '../lib/Poster.js';

export const PosterBundle = [
  CreativeWorkMixin as Mixin,
  PosterMixin as Mixin];
