import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { SportingGoodsStoreMixin } from '../lib/SportingGoodsStore.js';
import { StoreMixin } from '../lib/Store.js';

export const SportingGoodsStoreBundle = [
  SportingGoodsStoreMixin as Mixin,
  StoreMixin as Mixin];
