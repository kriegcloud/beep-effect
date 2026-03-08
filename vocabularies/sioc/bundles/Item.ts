import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ContainerMixin } from '../lib/Container.js';
import { ItemMixin } from '../lib/Item.js';
import { UserAccountMixin } from '../lib/UserAccount.js';

export const ItemBundle = [
  ContainerMixin as Mixin,
  ItemMixin as Mixin,
  UserAccountMixin as Mixin];
