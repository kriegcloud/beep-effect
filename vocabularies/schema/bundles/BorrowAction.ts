import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { BorrowActionMixin } from '../lib/BorrowAction.js';
import { OrganizationMixin } from '../lib/Organization.js';
import { PersonMixin } from '../lib/Person.js';
import { TransferActionMixin } from '../lib/TransferAction.js';

export const BorrowActionBundle = [
  BorrowActionMixin as Mixin,
  OrganizationMixin as Mixin,
  PersonMixin as Mixin,
  TransferActionMixin as Mixin];
