import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { MedicalEntityMixin } from '../lib/MedicalEntity.js';
import { MedicalRiskFactorMixin } from '../lib/MedicalRiskFactor.js';

export const MedicalRiskFactorBundle = [
  MedicalEntityMixin as Mixin,
  MedicalRiskFactorMixin as Mixin];
