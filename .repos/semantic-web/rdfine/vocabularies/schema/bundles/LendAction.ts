import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { LendActionMixin } from '../lib/LendAction.js';
import { PersonMixin } from '../lib/Person.js';
import { TransferActionMixin } from '../lib/TransferAction.js';

export const LendActionBundle = [
  LendActionMixin as Mixin,
  PersonMixin as Mixin,
  TransferActionMixin as Mixin];
