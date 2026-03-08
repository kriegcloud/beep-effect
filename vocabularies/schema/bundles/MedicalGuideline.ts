import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { MedicalEntityMixin } from '../lib/MedicalEntity.js';
import { MedicalGuidelineMixin } from '../lib/MedicalGuideline.js';

export const MedicalGuidelineBundle = [
  MedicalEntityMixin as Mixin,
  MedicalGuidelineMixin as Mixin];
