import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DurationMixin } from '../lib/Duration.js';
import { IntangibleMixin } from '../lib/Intangible.js';
import { ScheduleMixin } from '../lib/Schedule.js';

export const ScheduleBundle = [
  DurationMixin as Mixin,
  IntangibleMixin as Mixin,
  ScheduleMixin as Mixin];
