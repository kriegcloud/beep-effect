import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { BikeStoreMixin } from '../lib/BikeStore.js';
import { StoreMixin } from '../lib/Store.js';

export const BikeStoreBundle = [
  BikeStoreMixin as Mixin,
  StoreMixin as Mixin];
