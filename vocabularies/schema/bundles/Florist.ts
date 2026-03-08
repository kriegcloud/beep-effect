import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { FloristMixin } from '../lib/Florist.js';
import { StoreMixin } from '../lib/Store.js';

export const FloristBundle = [
  FloristMixin as Mixin,
  StoreMixin as Mixin];
