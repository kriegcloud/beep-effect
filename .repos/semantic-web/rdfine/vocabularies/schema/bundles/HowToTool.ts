import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { HowToItemMixin } from '../lib/HowToItem.js';
import { HowToToolMixin } from '../lib/HowToTool.js';

export const HowToToolBundle = [
  HowToItemMixin as Mixin,
  HowToToolMixin as Mixin];
