import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { BioChemEntityMixin } from '../lib/BioChemEntity.js';
import { ProteinMixin } from '../lib/Protein.js';

export const ProteinBundle = [
  BioChemEntityMixin as Mixin,
  ProteinMixin as Mixin];
