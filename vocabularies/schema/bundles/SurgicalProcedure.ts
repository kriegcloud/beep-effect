import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { MedicalProcedureMixin } from '../lib/MedicalProcedure.js';
import { SurgicalProcedureMixin } from '../lib/SurgicalProcedure.js';

export const SurgicalProcedureBundle = [
  MedicalProcedureMixin as Mixin,
  SurgicalProcedureMixin as Mixin];
