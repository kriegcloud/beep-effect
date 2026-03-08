import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { MedicalGuidelineContraindicationMixin } from '../lib/MedicalGuidelineContraindication.js';
import { MedicalGuidelineMixin } from '../lib/MedicalGuideline.js';

export const MedicalGuidelineContraindicationBundle = [
  MedicalGuidelineContraindicationMixin as Mixin,
  MedicalGuidelineMixin as Mixin];
