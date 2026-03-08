import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { MedicalEntityMixin } from '../lib/MedicalEntity.js';
import { MedicalProcedureMixin } from '../lib/MedicalProcedure.js';

export const MedicalProcedureBundle = [
  MedicalEntityMixin as Mixin,
  MedicalProcedureMixin as Mixin];
