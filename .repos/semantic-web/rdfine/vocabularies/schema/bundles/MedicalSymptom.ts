import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { MedicalSignOrSymptomMixin } from '../lib/MedicalSignOrSymptom.js';
import { MedicalSymptomMixin } from '../lib/MedicalSymptom.js';

export const MedicalSymptomBundle = [
  MedicalSignOrSymptomMixin as Mixin,
  MedicalSymptomMixin as Mixin];
