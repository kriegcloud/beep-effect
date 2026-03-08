import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { MedicalStudyMixin } from '../lib/MedicalStudy.js';
import { MedicalTrialMixin } from '../lib/MedicalTrial.js';

export const MedicalTrialBundle = [
  MedicalStudyMixin as Mixin,
  MedicalTrialMixin as Mixin];
