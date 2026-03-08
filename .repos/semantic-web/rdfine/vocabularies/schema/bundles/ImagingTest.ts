import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ImagingTestMixin } from '../lib/ImagingTest.js';
import { MedicalTestMixin } from '../lib/MedicalTest.js';

export const ImagingTestBundle = [
  ImagingTestMixin as Mixin,
  MedicalTestMixin as Mixin];
