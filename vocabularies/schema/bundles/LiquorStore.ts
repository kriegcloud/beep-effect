import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { LiquorStoreMixin } from '../lib/LiquorStore.js';
import { StoreMixin } from '../lib/Store.js';

export const LiquorStoreBundle = [
  LiquorStoreMixin as Mixin,
  StoreMixin as Mixin];
