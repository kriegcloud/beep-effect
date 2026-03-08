import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DoseScheduleMixin } from '../lib/DoseSchedule.js';
import { DrugMixin } from '../lib/Drug.js';
import { MedicalEntityMixin } from '../lib/MedicalEntity.js';
import { MedicalProcedureMixin } from '../lib/MedicalProcedure.js';
import { TherapeuticProcedureMixin } from '../lib/TherapeuticProcedure.js';

export const TherapeuticProcedureBundle = [
  DoseScheduleMixin as Mixin,
  DrugMixin as Mixin,
  MedicalEntityMixin as Mixin,
  MedicalProcedureMixin as Mixin,
  TherapeuticProcedureMixin as Mixin];
