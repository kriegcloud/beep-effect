import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DoseScheduleMixin } from '../lib/DoseSchedule.js';
import { MedicalIntangibleMixin } from '../lib/MedicalIntangible.js';

export const DoseScheduleBundle = [
  DoseScheduleMixin as Mixin,
  MedicalIntangibleMixin as Mixin];
