import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { MenuItemMixin } from '../lib/MenuItem.js';
import { MenuMixin } from '../lib/Menu.js';
import { MenuSectionMixin } from '../lib/MenuSection.js';

export const MenuBundle = [
  CreativeWorkMixin as Mixin,
  MenuItemMixin as Mixin,
  MenuMixin as Mixin,
  MenuSectionMixin as Mixin];
