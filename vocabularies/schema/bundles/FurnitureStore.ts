import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { FurnitureStoreMixin } from '../lib/FurnitureStore.js';
import { StoreMixin } from '../lib/Store.js';

export const FurnitureStoreBundle = [
  FurnitureStoreMixin as Mixin,
  StoreMixin as Mixin];
