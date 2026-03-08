import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { MedicalTherapyMixin } from '../lib/MedicalTherapy.js';
import { PhysicalTherapyMixin } from '../lib/PhysicalTherapy.js';

export const PhysicalTherapyBundle = [
  MedicalTherapyMixin as Mixin,
  PhysicalTherapyMixin as Mixin];
