import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CheckActionMixin } from '../lib/CheckAction.js';
import { FindActionMixin } from '../lib/FindAction.js';

export const CheckActionBundle = [
  CheckActionMixin as Mixin,
  FindActionMixin as Mixin];
