import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DrugClassMixin } from '../lib/DrugClass.js';
import { DrugMixin } from '../lib/Drug.js';
import { MedicalEntityMixin } from '../lib/MedicalEntity.js';

export const DrugClassBundle = [
  DrugClassMixin as Mixin,
  DrugMixin as Mixin,
  MedicalEntityMixin as Mixin];
