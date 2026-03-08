import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { HomeGoodsStoreMixin } from '../lib/HomeGoodsStore.js';
import { StoreMixin } from '../lib/Store.js';

export const HomeGoodsStoreBundle = [
  HomeGoodsStoreMixin as Mixin,
  StoreMixin as Mixin];
