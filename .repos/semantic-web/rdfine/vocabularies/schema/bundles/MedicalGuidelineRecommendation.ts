import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { MedicalGuidelineMixin } from '../lib/MedicalGuideline.js';
import { MedicalGuidelineRecommendationMixin } from '../lib/MedicalGuidelineRecommendation.js';

export const MedicalGuidelineRecommendationBundle = [
  MedicalGuidelineMixin as Mixin,
  MedicalGuidelineRecommendationMixin as Mixin];
