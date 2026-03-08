import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { HowToSectionMixin } from '../lib/HowToSection.js';
import { ItemListMixin } from '../lib/ItemList.js';
import { ListItemMixin } from '../lib/ListItem.js';

export const HowToSectionBundle = [
  CreativeWorkMixin as Mixin,
  HowToSectionMixin as Mixin,
  ItemListMixin as Mixin,
  ListItemMixin as Mixin];
