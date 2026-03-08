import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CancelActionMixin } from '../lib/CancelAction.js';
import { PlanActionMixin } from '../lib/PlanAction.js';

export const CancelActionBundle = [
  CancelActionMixin as Mixin,
  PlanActionMixin as Mixin];
