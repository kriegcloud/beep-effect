import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CreateActionMixin } from '../lib/CreateAction.js';
import { PhotographActionMixin } from '../lib/PhotographAction.js';

export const PhotographActionBundle = [
  CreateActionMixin as Mixin,
  PhotographActionMixin as Mixin];
