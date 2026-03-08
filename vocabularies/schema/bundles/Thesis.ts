import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { ThesisMixin } from '../lib/Thesis.js';

export const ThesisBundle = [
  CreativeWorkMixin as Mixin,
  ThesisMixin as Mixin];
