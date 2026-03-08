import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ActionMixin } from '../lib/Action.js';
import { FindActionMixin } from '../lib/FindAction.js';

export const FindActionBundle = [
  ActionMixin as Mixin,
  FindActionMixin as Mixin];
