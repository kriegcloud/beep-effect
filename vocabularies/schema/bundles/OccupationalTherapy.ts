import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { MedicalTherapyMixin } from '../lib/MedicalTherapy.js';
import { OccupationalTherapyMixin } from '../lib/OccupationalTherapy.js';

export const OccupationalTherapyBundle = [
  MedicalTherapyMixin as Mixin,
  OccupationalTherapyMixin as Mixin];
