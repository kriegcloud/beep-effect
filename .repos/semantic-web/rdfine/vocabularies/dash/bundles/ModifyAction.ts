import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ModifyActionMixin } from '../lib/ModifyAction.js';
import { ResourceActionMixin } from '../lib/ResourceAction.js';

export const ModifyActionBundle = [
  ModifyActionMixin as Mixin,
  ResourceActionMixin as Mixin];
