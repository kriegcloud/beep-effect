import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { MedicalIndicationMixin } from '../lib/MedicalIndication.js';
import { TreatmentIndicationMixin } from '../lib/TreatmentIndication.js';

export const TreatmentIndicationBundle = [
  MedicalIndicationMixin as Mixin,
  TreatmentIndicationMixin as Mixin];
