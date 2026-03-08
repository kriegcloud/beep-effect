import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { IntangibleMixin } from '../lib/Intangible.js';
import { ListItemMixin } from '../lib/ListItem.js';
import { ThingMixin } from '../lib/Thing.js';

export const ListItemBundle = [
  IntangibleMixin as Mixin,
  ListItemMixin as Mixin,
  ThingMixin as Mixin];
