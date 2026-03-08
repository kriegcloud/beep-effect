import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { LifestyleModificationMixin } from '../lib/LifestyleModification.js';
import { MedicalEntityMixin } from '../lib/MedicalEntity.js';

export const LifestyleModificationBundle = [
  LifestyleModificationMixin as Mixin,
  MedicalEntityMixin as Mixin];
