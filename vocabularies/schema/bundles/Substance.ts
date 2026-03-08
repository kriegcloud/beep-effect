import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { MaximumDoseScheduleMixin } from '../lib/MaximumDoseSchedule.js';
import { MedicalEntityMixin } from '../lib/MedicalEntity.js';
import { SubstanceMixin } from '../lib/Substance.js';

export const SubstanceBundle = [
  MaximumDoseScheduleMixin as Mixin,
  MedicalEntityMixin as Mixin,
  SubstanceMixin as Mixin];
