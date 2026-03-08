import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ActionMixin } from '../lib/Action.js';
import { ResourceActionMixin } from '../lib/ResourceAction.js';

export const ResourceActionBundle = [
  ActionMixin as Mixin,
  ResourceActionMixin as Mixin];
