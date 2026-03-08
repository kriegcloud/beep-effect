import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { MedicalTestMixin } from '../lib/MedicalTest.js';
import { PathologyTestMixin } from '../lib/PathologyTest.js';

export const PathologyTestBundle = [
  MedicalTestMixin as Mixin,
  PathologyTestMixin as Mixin];
