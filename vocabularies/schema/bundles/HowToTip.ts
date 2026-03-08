import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { HowToTipMixin } from '../lib/HowToTip.js';
import { ListItemMixin } from '../lib/ListItem.js';

export const HowToTipBundle = [
  CreativeWorkMixin as Mixin,
  HowToTipMixin as Mixin,
  ListItemMixin as Mixin];
