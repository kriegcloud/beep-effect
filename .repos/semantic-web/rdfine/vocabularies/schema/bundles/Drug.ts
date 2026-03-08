import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DoseScheduleMixin } from '../lib/DoseSchedule.js';
import { DrugClassMixin } from '../lib/DrugClass.js';
import { DrugLegalStatusMixin } from '../lib/DrugLegalStatus.js';
import { DrugMixin } from '../lib/Drug.js';
import { DrugStrengthMixin } from '../lib/DrugStrength.js';
import { HealthInsurancePlanMixin } from '../lib/HealthInsurancePlan.js';
import { MaximumDoseScheduleMixin } from '../lib/MaximumDoseSchedule.js';
import { ProductMixin } from '../lib/Product.js';
import { SubstanceMixin } from '../lib/Substance.js';

export const DrugBundle = [
  DoseScheduleMixin as Mixin,
  DrugClassMixin as Mixin,
  DrugLegalStatusMixin as Mixin,
  DrugMixin as Mixin,
  DrugStrengthMixin as Mixin,
  HealthInsurancePlanMixin as Mixin,
  MaximumDoseScheduleMixin as Mixin,
  ProductMixin as Mixin,
  SubstanceMixin as Mixin];
