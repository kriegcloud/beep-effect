import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { BioChemEntityMixin } from '../lib/BioChemEntity.js';
import { MolecularEntityMixin } from '../lib/MolecularEntity.js';
import { QuantitativeValueMixin } from '../lib/QuantitativeValue.js';

export const MolecularEntityBundle = [
  BioChemEntityMixin as Mixin,
  MolecularEntityMixin as Mixin,
  QuantitativeValueMixin as Mixin];
