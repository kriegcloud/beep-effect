import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { PlayMixin } from '../lib/Play.js';

export const PlayBundle = [
  CreativeWorkMixin as Mixin,
  PlayMixin as Mixin];
