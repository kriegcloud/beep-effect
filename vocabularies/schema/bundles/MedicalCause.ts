import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { MedicalCauseMixin } from '../lib/MedicalCause.js';
import { MedicalEntityMixin } from '../lib/MedicalEntity.js';

export const MedicalCauseBundle = [
  MedicalCauseMixin as Mixin,
  MedicalEntityMixin as Mixin];
