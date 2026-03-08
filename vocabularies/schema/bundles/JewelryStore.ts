import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { JewelryStoreMixin } from '../lib/JewelryStore.js';
import { StoreMixin } from '../lib/Store.js';

export const JewelryStoreBundle = [
  JewelryStoreMixin as Mixin,
  StoreMixin as Mixin];
