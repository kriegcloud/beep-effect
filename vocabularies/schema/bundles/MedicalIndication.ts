import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { MedicalEntityMixin } from '../lib/MedicalEntity.js';
import { MedicalIndicationMixin } from '../lib/MedicalIndication.js';

export const MedicalIndicationBundle = [
  MedicalEntityMixin as Mixin,
  MedicalIndicationMixin as Mixin];
