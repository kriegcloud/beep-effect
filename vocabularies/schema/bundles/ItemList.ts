import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { IntangibleMixin } from '../lib/Intangible.js';
import { ItemListMixin } from '../lib/ItemList.js';
import { ListItemMixin } from '../lib/ListItem.js';
import { ThingMixin } from '../lib/Thing.js';

export const ItemListBundle = [
  IntangibleMixin as Mixin,
  ItemListMixin as Mixin,
  ListItemMixin as Mixin,
  ThingMixin as Mixin];
