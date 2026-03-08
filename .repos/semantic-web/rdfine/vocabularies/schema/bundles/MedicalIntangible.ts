import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { MedicalEntityMixin } from '../lib/MedicalEntity.js';
import { MedicalIntangibleMixin } from '../lib/MedicalIntangible.js';

export const MedicalIntangibleBundle = [
  MedicalEntityMixin as Mixin,
  MedicalIntangibleMixin as Mixin];
