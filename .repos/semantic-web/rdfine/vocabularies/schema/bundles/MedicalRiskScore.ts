import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { MedicalRiskEstimatorMixin } from '../lib/MedicalRiskEstimator.js';
import { MedicalRiskScoreMixin } from '../lib/MedicalRiskScore.js';

export const MedicalRiskScoreBundle = [
  MedicalRiskEstimatorMixin as Mixin,
  MedicalRiskScoreMixin as Mixin];
