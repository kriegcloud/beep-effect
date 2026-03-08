import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ShoeStoreMixin } from '../lib/ShoeStore.js';
import { StoreMixin } from '../lib/Store.js';

export const ShoeStoreBundle = [
  ShoeStoreMixin as Mixin,
  StoreMixin as Mixin];
