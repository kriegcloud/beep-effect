import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { SculptureMixin } from '../lib/Sculpture.js';

export const SculptureBundle = [
  CreativeWorkMixin as Mixin,
  SculptureMixin as Mixin];
