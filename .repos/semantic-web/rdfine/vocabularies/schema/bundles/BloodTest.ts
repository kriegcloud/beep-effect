import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { BloodTestMixin } from '../lib/BloodTest.js';
import { MedicalTestMixin } from '../lib/MedicalTest.js';

export const BloodTestBundle = [
  BloodTestMixin as Mixin,
  MedicalTestMixin as Mixin];
