import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DiagnosticLabMixin } from '../lib/DiagnosticLab.js';
import { MedicalOrganizationMixin } from '../lib/MedicalOrganization.js';
import { MedicalTestMixin } from '../lib/MedicalTest.js';

export const DiagnosticLabBundle = [
  DiagnosticLabMixin as Mixin,
  MedicalOrganizationMixin as Mixin,
  MedicalTestMixin as Mixin];
