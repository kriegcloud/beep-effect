import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { BioChemEntityMixin } from '../lib/BioChemEntity.js';
import { ChemicalSubstanceMixin } from '../lib/ChemicalSubstance.js';

export const ChemicalSubstanceBundle = [
  BioChemEntityMixin as Mixin,
  ChemicalSubstanceMixin as Mixin];
