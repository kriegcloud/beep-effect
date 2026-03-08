import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DiagnosticProcedureMixin } from '../lib/DiagnosticProcedure.js';
import { MedicalProcedureMixin } from '../lib/MedicalProcedure.js';

export const DiagnosticProcedureBundle = [
  DiagnosticProcedureMixin as Mixin,
  MedicalProcedureMixin as Mixin];
