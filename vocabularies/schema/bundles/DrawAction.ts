import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CreateActionMixin } from '../lib/CreateAction.js';
import { DrawActionMixin } from '../lib/DrawAction.js';

export const DrawActionBundle = [
  CreateActionMixin as Mixin,
  DrawActionMixin as Mixin];
