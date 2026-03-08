import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DrugMixin } from '../lib/Drug.js';
import { MedicalAudienceMixin } from '../lib/MedicalAudience.js';
import { MedicalConditionMixin } from '../lib/MedicalCondition.js';
import { PatientMixin } from '../lib/Patient.js';
import { PersonMixin } from '../lib/Person.js';

export const PatientBundle = [
  DrugMixin as Mixin,
  MedicalAudienceMixin as Mixin,
  MedicalConditionMixin as Mixin,
  PatientMixin as Mixin,
  PersonMixin as Mixin];
