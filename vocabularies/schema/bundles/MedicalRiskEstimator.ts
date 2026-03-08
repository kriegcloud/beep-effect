import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { MedicalEntityMixin } from '../lib/MedicalEntity.js';
import { MedicalRiskEstimatorMixin } from '../lib/MedicalRiskEstimator.js';
import { MedicalRiskFactorMixin } from '../lib/MedicalRiskFactor.js';

export const MedicalRiskEstimatorBundle = [
  MedicalEntityMixin as Mixin,
  MedicalRiskEstimatorMixin as Mixin,
  MedicalRiskFactorMixin as Mixin];
