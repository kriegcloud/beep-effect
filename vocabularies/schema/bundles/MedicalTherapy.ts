import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { MedicalContraindicationMixin } from '../lib/MedicalContraindication.js';
import { MedicalEntityMixin } from '../lib/MedicalEntity.js';
import { MedicalTherapyMixin } from '../lib/MedicalTherapy.js';
import { TherapeuticProcedureMixin } from '../lib/TherapeuticProcedure.js';

export const MedicalTherapyBundle = [
  MedicalContraindicationMixin as Mixin,
  MedicalEntityMixin as Mixin,
  MedicalTherapyMixin as Mixin,
  TherapeuticProcedureMixin as Mixin];
