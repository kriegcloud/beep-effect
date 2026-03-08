import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { MedicalSignMixin } from '../lib/MedicalSign.js';
import { VitalSignMixin } from '../lib/VitalSign.js';

export const VitalSignBundle = [
  MedicalSignMixin as Mixin,
  VitalSignMixin as Mixin];
