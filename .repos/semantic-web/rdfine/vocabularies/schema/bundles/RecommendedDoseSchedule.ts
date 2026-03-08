import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DoseScheduleMixin } from '../lib/DoseSchedule.js';
import { RecommendedDoseScheduleMixin } from '../lib/RecommendedDoseSchedule.js';

export const RecommendedDoseScheduleBundle = [
  DoseScheduleMixin as Mixin,
  RecommendedDoseScheduleMixin as Mixin];
