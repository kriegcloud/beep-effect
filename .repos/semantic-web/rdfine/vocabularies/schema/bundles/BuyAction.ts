import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { BuyActionMixin } from '../lib/BuyAction.js';
import { OrganizationMixin } from '../lib/Organization.js';
import { PersonMixin } from '../lib/Person.js';
import { TradeActionMixin } from '../lib/TradeAction.js';
import { WarrantyPromiseMixin } from '../lib/WarrantyPromise.js';

export const BuyActionBundle = [
  BuyActionMixin as Mixin,
  OrganizationMixin as Mixin,
  PersonMixin as Mixin,
  TradeActionMixin as Mixin,
  WarrantyPromiseMixin as Mixin];
