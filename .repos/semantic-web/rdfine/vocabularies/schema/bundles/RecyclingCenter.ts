import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { LocalBusinessMixin } from '../lib/LocalBusiness.js';
import { RecyclingCenterMixin } from '../lib/RecyclingCenter.js';

export const RecyclingCenterBundle = [
  LocalBusinessMixin as Mixin,
  RecyclingCenterMixin as Mixin];
