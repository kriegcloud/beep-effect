import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { MedicalClinicMixin } from '../lib/MedicalClinic.js';
import { MedicalOrganizationMixin } from '../lib/MedicalOrganization.js';
import { MedicalProcedureMixin } from '../lib/MedicalProcedure.js';
import { MedicalTestMixin } from '../lib/MedicalTest.js';
import { MedicalTherapyMixin } from '../lib/MedicalTherapy.js';

export const MedicalClinicBundle = [
  MedicalClinicMixin as Mixin,
  MedicalOrganizationMixin as Mixin,
  MedicalProcedureMixin as Mixin,
  MedicalTestMixin as Mixin,
  MedicalTherapyMixin as Mixin];
