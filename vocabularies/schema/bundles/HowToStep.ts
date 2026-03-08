import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { HowToStepMixin } from '../lib/HowToStep.js';
import { ItemListMixin } from '../lib/ItemList.js';
import { ListItemMixin } from '../lib/ListItem.js';

export const HowToStepBundle = [
  CreativeWorkMixin as Mixin,
  HowToStepMixin as Mixin,
  ItemListMixin as Mixin,
  ListItemMixin as Mixin];
