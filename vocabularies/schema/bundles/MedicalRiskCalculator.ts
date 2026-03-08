import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { MedicalRiskCalculatorMixin } from '../lib/MedicalRiskCalculator.js';
import { MedicalRiskEstimatorMixin } from '../lib/MedicalRiskEstimator.js';

export const MedicalRiskCalculatorBundle = [
  MedicalRiskCalculatorMixin as Mixin,
  MedicalRiskEstimatorMixin as Mixin];
