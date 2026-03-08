import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { MedicalTherapyMixin } from '../lib/MedicalTherapy.js';
import { RadiationTherapyMixin } from '../lib/RadiationTherapy.js';

export const RadiationTherapyBundle = [
  MedicalTherapyMixin as Mixin,
  RadiationTherapyMixin as Mixin];
