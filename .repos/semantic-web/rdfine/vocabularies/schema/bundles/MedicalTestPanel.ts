import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { MedicalTestMixin } from '../lib/MedicalTest.js';
import { MedicalTestPanelMixin } from '../lib/MedicalTestPanel.js';

export const MedicalTestPanelBundle = [
  MedicalTestMixin as Mixin,
  MedicalTestPanelMixin as Mixin];
