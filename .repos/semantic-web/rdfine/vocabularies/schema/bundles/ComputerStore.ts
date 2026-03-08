import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ComputerStoreMixin } from '../lib/ComputerStore.js';
import { StoreMixin } from '../lib/Store.js';

export const ComputerStoreBundle = [
  ComputerStoreMixin as Mixin,
  StoreMixin as Mixin];
