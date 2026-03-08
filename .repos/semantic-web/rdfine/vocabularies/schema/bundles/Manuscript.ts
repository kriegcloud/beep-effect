import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { ManuscriptMixin } from '../lib/Manuscript.js';

export const ManuscriptBundle = [
  CreativeWorkMixin as Mixin,
  ManuscriptMixin as Mixin];
