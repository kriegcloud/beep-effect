import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { GroceryStoreMixin } from '../lib/GroceryStore.js';
import { StoreMixin } from '../lib/Store.js';

export const GroceryStoreBundle = [
  GroceryStoreMixin as Mixin,
  StoreMixin as Mixin];
