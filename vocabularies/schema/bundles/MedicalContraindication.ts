import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { MedicalContraindicationMixin } from '../lib/MedicalContraindication.js';
import { MedicalEntityMixin } from '../lib/MedicalEntity.js';

export const MedicalContraindicationBundle = [
  MedicalContraindicationMixin as Mixin,
  MedicalEntityMixin as Mixin];
