import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { PlanActionMixin } from '../lib/PlanAction.js';
import { ReserveActionMixin } from '../lib/ReserveAction.js';

export const ReserveActionBundle = [
  PlanActionMixin as Mixin,
  ReserveActionMixin as Mixin];
