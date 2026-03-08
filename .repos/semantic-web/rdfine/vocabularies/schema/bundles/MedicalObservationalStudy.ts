import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { MedicalObservationalStudyMixin } from '../lib/MedicalObservationalStudy.js';
import { MedicalStudyMixin } from '../lib/MedicalStudy.js';

export const MedicalObservationalStudyBundle = [
  MedicalObservationalStudyMixin as Mixin,
  MedicalStudyMixin as Mixin];
