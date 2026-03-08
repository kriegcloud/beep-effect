import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DDxElementMixin } from '../lib/DDxElement.js';
import { MedicalConditionMixin } from '../lib/MedicalCondition.js';
import { MedicalIntangibleMixin } from '../lib/MedicalIntangible.js';
import { MedicalSignOrSymptomMixin } from '../lib/MedicalSignOrSymptom.js';

export const DDxElementBundle = [
  DDxElementMixin as Mixin,
  MedicalConditionMixin as Mixin,
  MedicalIntangibleMixin as Mixin,
  MedicalSignOrSymptomMixin as Mixin];
