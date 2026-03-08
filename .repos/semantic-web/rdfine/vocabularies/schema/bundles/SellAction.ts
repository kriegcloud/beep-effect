import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { OrganizationMixin } from '../lib/Organization.js';
import { PersonMixin } from '../lib/Person.js';
import { SellActionMixin } from '../lib/SellAction.js';
import { TradeActionMixin } from '../lib/TradeAction.js';
import { WarrantyPromiseMixin } from '../lib/WarrantyPromise.js';

export const SellActionBundle = [
  OrganizationMixin as Mixin,
  PersonMixin as Mixin,
  SellActionMixin as Mixin,
  TradeActionMixin as Mixin,
  WarrantyPromiseMixin as Mixin];
