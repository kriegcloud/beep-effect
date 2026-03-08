import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { HowToItemMixin } from '../lib/HowToItem.js';
import { ListItemMixin } from '../lib/ListItem.js';
import { QuantitativeValueMixin } from '../lib/QuantitativeValue.js';

export const HowToItemBundle = [
  HowToItemMixin as Mixin,
  ListItemMixin as Mixin,
  QuantitativeValueMixin as Mixin];
