import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { OutletStoreMixin } from '../lib/OutletStore.js';
import { StoreMixin } from '../lib/Store.js';

export const OutletStoreBundle = [
  OutletStoreMixin as Mixin,
  StoreMixin as Mixin];
