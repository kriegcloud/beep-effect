import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ActionMixin } from '../lib/Action.js';
import { CreateActionMixin } from '../lib/CreateAction.js';

export const CreateActionBundle = [
  ActionMixin as Mixin,
  CreateActionMixin as Mixin];
