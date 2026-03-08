import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ContainerMixin } from '../lib/Container.js';
import { ItemMixin } from '../lib/Item.js';
import { SiteMixin } from '../lib/Site.js';
import { UserAccountMixin } from '../lib/UserAccount.js';

export const ContainerBundle = [
  ContainerMixin as Mixin,
  ItemMixin as Mixin,
  SiteMixin as Mixin,
  UserAccountMixin as Mixin];
