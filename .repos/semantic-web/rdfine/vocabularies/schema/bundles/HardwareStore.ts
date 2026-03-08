import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { HardwareStoreMixin } from '../lib/HardwareStore.js';
import { StoreMixin } from '../lib/Store.js';

export const HardwareStoreBundle = [
  HardwareStoreMixin as Mixin,
  StoreMixin as Mixin];
