import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ActionMixin } from '../lib/Action.js';
import { PlaceMixin } from '../lib/Place.js';
import { TransferActionMixin } from '../lib/TransferAction.js';

export const TransferActionBundle = [
  ActionMixin as Mixin,
  PlaceMixin as Mixin,
  TransferActionMixin as Mixin];
