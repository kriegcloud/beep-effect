import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { StoreMixin } from '../lib/Store.js';
import { WholesaleStoreMixin } from '../lib/WholesaleStore.js';

export const WholesaleStoreBundle = [
  StoreMixin as Mixin,
  WholesaleStoreMixin as Mixin];
