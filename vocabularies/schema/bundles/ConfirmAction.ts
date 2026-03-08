import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ConfirmActionMixin } from '../lib/ConfirmAction.js';
import { InformActionMixin } from '../lib/InformAction.js';

export const ConfirmActionBundle = [
  ConfirmActionMixin as Mixin,
  InformActionMixin as Mixin];
