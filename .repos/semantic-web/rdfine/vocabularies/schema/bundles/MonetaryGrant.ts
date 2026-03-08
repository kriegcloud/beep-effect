import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { GrantMixin } from '../lib/Grant.js';
import { MonetaryAmountMixin } from '../lib/MonetaryAmount.js';
import { MonetaryGrantMixin } from '../lib/MonetaryGrant.js';
import { OrganizationMixin } from '../lib/Organization.js';
import { PersonMixin } from '../lib/Person.js';

export const MonetaryGrantBundle = [
  GrantMixin as Mixin,
  MonetaryAmountMixin as Mixin,
  MonetaryGrantMixin as Mixin,
  OrganizationMixin as Mixin,
  PersonMixin as Mixin];
