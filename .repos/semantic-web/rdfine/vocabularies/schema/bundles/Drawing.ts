import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { DrawingMixin } from '../lib/Drawing.js';

export const DrawingBundle = [
  CreativeWorkMixin as Mixin,
  DrawingMixin as Mixin];
