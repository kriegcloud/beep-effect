import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ActionMixin } from '../lib/Action.js';
import { OrganizeActionMixin } from '../lib/OrganizeAction.js';

export const OrganizeActionBundle = [
  ActionMixin as Mixin,
  OrganizeActionMixin as Mixin];
