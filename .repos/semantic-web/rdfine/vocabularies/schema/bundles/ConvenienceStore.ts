import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ConvenienceStoreMixin } from '../lib/ConvenienceStore.js';
import { StoreMixin } from '../lib/Store.js';

export const ConvenienceStoreBundle = [
  ConvenienceStoreMixin as Mixin,
  StoreMixin as Mixin];
