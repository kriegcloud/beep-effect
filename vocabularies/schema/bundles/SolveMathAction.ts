import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ActionMixin } from '../lib/Action.js';
import { SolveMathActionMixin } from '../lib/SolveMathAction.js';

export const SolveMathActionBundle = [
  ActionMixin as Mixin,
  SolveMathActionMixin as Mixin];
