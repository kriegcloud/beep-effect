import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { GardenStoreMixin } from '../lib/GardenStore.js';
import { StoreMixin } from '../lib/Store.js';

export const GardenStoreBundle = [
  GardenStoreMixin as Mixin,
  StoreMixin as Mixin];
