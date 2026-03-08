import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { MedicalProcedureMixin } from '../lib/MedicalProcedure.js';
import { MedicalTherapyMixin } from '../lib/MedicalTherapy.js';
import { PalliativeProcedureMixin } from '../lib/PalliativeProcedure.js';

export const PalliativeProcedureBundle = [
  MedicalProcedureMixin as Mixin,
  MedicalTherapyMixin as Mixin,
  PalliativeProcedureMixin as Mixin];
