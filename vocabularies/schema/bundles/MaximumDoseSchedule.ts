import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DoseScheduleMixin } from '../lib/DoseSchedule.js';
import { MaximumDoseScheduleMixin } from '../lib/MaximumDoseSchedule.js';

export const MaximumDoseScheduleBundle = [
  DoseScheduleMixin as Mixin,
  MaximumDoseScheduleMixin as Mixin];
