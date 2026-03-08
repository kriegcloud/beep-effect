import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { PsychologicalTreatmentMixin } from '../lib/PsychologicalTreatment.js';
import { TherapeuticProcedureMixin } from '../lib/TherapeuticProcedure.js';

export const PsychologicalTreatmentBundle = [
  PsychologicalTreatmentMixin as Mixin,
  TherapeuticProcedureMixin as Mixin];
