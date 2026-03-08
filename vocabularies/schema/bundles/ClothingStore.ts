import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ClothingStoreMixin } from '../lib/ClothingStore.js';
import { StoreMixin } from '../lib/Store.js';

export const ClothingStoreBundle = [
  ClothingStoreMixin as Mixin,
  StoreMixin as Mixin];
