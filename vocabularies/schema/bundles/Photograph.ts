import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { PhotographMixin } from '../lib/Photograph.js';

export const PhotographBundle = [
  CreativeWorkMixin as Mixin,
  PhotographMixin as Mixin];
