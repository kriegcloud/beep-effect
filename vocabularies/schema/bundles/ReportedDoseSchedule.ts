import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DoseScheduleMixin } from '../lib/DoseSchedule.js';
import { ReportedDoseScheduleMixin } from '../lib/ReportedDoseSchedule.js';

export const ReportedDoseScheduleBundle = [
  DoseScheduleMixin as Mixin,
  ReportedDoseScheduleMixin as Mixin];
