import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { OrganizeActionMixin } from '../lib/OrganizeAction.js';
import { PlanActionMixin } from '../lib/PlanAction.js';

export const PlanActionBundle = [
  OrganizeActionMixin as Mixin,
  PlanActionMixin as Mixin];
