import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AtlasMixin } from '../lib/Atlas.js';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';

export const AtlasBundle = [
  AtlasMixin as Mixin,
  CreativeWorkMixin as Mixin];
