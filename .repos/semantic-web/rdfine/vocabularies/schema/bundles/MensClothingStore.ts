import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { MensClothingStoreMixin } from '../lib/MensClothingStore.js';
import { StoreMixin } from '../lib/Store.js';

export const MensClothingStoreBundle = [
  MensClothingStoreMixin as Mixin,
  StoreMixin as Mixin];
