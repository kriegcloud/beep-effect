import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ElectronicsStoreMixin } from '../lib/ElectronicsStore.js';
import { StoreMixin } from '../lib/Store.js';

export const ElectronicsStoreBundle = [
  ElectronicsStoreMixin as Mixin,
  StoreMixin as Mixin];
