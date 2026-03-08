import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AdministrativeAreaMixin } from '../lib/AdministrativeArea.js';
import { DrugStrengthMixin } from '../lib/DrugStrength.js';
import { MaximumDoseScheduleMixin } from '../lib/MaximumDoseSchedule.js';
import { MedicalIntangibleMixin } from '../lib/MedicalIntangible.js';

export const DrugStrengthBundle = [
  AdministrativeAreaMixin as Mixin,
  DrugStrengthMixin as Mixin,
  MaximumDoseScheduleMixin as Mixin,
  MedicalIntangibleMixin as Mixin];
