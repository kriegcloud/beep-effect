import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { StoreMixin } from '../lib/Store.js';
import { ToyStoreMixin } from '../lib/ToyStore.js';

export const ToyStoreBundle = [
  StoreMixin as Mixin,
  ToyStoreMixin as Mixin];
