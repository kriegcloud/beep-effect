import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AnatomicalStructureMixin } from '../lib/AnatomicalStructure.js';
import { AnatomicalSystemMixin } from '../lib/AnatomicalSystem.js';
import { BioChemEntityMixin } from '../lib/BioChemEntity.js';
import { GeneMixin } from '../lib/Gene.js';

export const GeneBundle = [
  AnatomicalStructureMixin as Mixin,
  AnatomicalSystemMixin as Mixin,
  BioChemEntityMixin as Mixin,
  GeneMixin as Mixin];
