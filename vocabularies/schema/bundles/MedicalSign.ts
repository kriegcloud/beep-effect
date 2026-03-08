import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { MedicalSignMixin } from '../lib/MedicalSign.js';
import { MedicalSignOrSymptomMixin } from '../lib/MedicalSignOrSymptom.js';
import { MedicalTestMixin } from '../lib/MedicalTest.js';

export const MedicalSignBundle = [
  MedicalSignMixin as Mixin,
  MedicalSignOrSymptomMixin as Mixin,
  MedicalTestMixin as Mixin];
