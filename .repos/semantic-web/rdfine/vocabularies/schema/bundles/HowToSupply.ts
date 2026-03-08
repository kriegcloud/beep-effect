import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { HowToItemMixin } from '../lib/HowToItem.js';
import { HowToSupplyMixin } from '../lib/HowToSupply.js';
import { MonetaryAmountMixin } from '../lib/MonetaryAmount.js';

export const HowToSupplyBundle = [
  HowToItemMixin as Mixin,
  HowToSupplyMixin as Mixin,
  MonetaryAmountMixin as Mixin];
