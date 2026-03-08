import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { PaintingMixin } from '../lib/Painting.js';

export const PaintingBundle = [
  CreativeWorkMixin as Mixin,
  PaintingMixin as Mixin];
