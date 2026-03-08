import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { TakeActionMixin } from '../lib/TakeAction.js';
import { TransferActionMixin } from '../lib/TransferAction.js';

export const TakeActionBundle = [
  TakeActionMixin as Mixin,
  TransferActionMixin as Mixin];
