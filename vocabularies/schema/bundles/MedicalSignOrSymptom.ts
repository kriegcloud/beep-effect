import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { MedicalConditionMixin } from '../lib/MedicalCondition.js';
import { MedicalSignOrSymptomMixin } from '../lib/MedicalSignOrSymptom.js';
import { MedicalTherapyMixin } from '../lib/MedicalTherapy.js';

export const MedicalSignOrSymptomBundle = [
  MedicalConditionMixin as Mixin,
  MedicalSignOrSymptomMixin as Mixin,
  MedicalTherapyMixin as Mixin];
