import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { PlanActionMixin } from '../lib/PlanAction.js';
import { ScheduleActionMixin } from '../lib/ScheduleAction.js';

export const ScheduleActionBundle = [
  PlanActionMixin as Mixin,
  ScheduleActionMixin as Mixin];
