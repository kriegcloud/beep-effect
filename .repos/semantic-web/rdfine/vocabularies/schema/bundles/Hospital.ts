import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CDCPMDRecordMixin } from '../lib/CDCPMDRecord.js';
import { CivicStructureMixin } from '../lib/CivicStructure.js';
import { DatasetMixin } from '../lib/Dataset.js';
import { EmergencyServiceMixin } from '../lib/EmergencyService.js';
import { HospitalMixin } from '../lib/Hospital.js';
import { MedicalOrganizationMixin } from '../lib/MedicalOrganization.js';
import { MedicalProcedureMixin } from '../lib/MedicalProcedure.js';
import { MedicalTestMixin } from '../lib/MedicalTest.js';
import { MedicalTherapyMixin } from '../lib/MedicalTherapy.js';

export const HospitalBundle = [
  CDCPMDRecordMixin as Mixin,
  CivicStructureMixin as Mixin,
  DatasetMixin as Mixin,
  EmergencyServiceMixin as Mixin,
  HospitalMixin as Mixin,
  MedicalOrganizationMixin as Mixin,
  MedicalProcedureMixin as Mixin,
  MedicalTestMixin as Mixin,
  MedicalTherapyMixin as Mixin];
