import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { HospitalMixin } from '../lib/Hospital.js';
import { MedicalOrganizationMixin } from '../lib/MedicalOrganization.js';
import { MedicalProcedureMixin } from '../lib/MedicalProcedure.js';
import { MedicalTestMixin } from '../lib/MedicalTest.js';
import { MedicalTherapyMixin } from '../lib/MedicalTherapy.js';
import { PhysicianMixin } from '../lib/Physician.js';

export const PhysicianBundle = [
  HospitalMixin as Mixin,
  MedicalOrganizationMixin as Mixin,
  MedicalProcedureMixin as Mixin,
  MedicalTestMixin as Mixin,
  MedicalTherapyMixin as Mixin,
  PhysicianMixin as Mixin];
