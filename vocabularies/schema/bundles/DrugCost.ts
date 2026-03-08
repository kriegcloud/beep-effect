import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AdministrativeAreaMixin } from '../lib/AdministrativeArea.js';
import { DrugCostMixin } from '../lib/DrugCost.js';
import { MedicalEntityMixin } from '../lib/MedicalEntity.js';

export const DrugCostBundle = [
  AdministrativeAreaMixin as Mixin,
  DrugCostMixin as Mixin,
  MedicalEntityMixin as Mixin];
