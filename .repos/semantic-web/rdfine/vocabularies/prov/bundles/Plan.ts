import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { EntityMixin } from '../lib/Entity.js';
import { PlanMixin } from '../lib/Plan.js';

export const PlanBundle = [
  EntityMixin as Mixin,
  PlanMixin as Mixin];
