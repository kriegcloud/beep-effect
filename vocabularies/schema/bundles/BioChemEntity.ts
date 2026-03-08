import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { BioChemEntityMixin } from '../lib/BioChemEntity.js';
import { GeneMixin } from '../lib/Gene.js';
import { GrantMixin } from '../lib/Grant.js';
import { MedicalConditionMixin } from '../lib/MedicalCondition.js';
import { PropertyValueMixin } from '../lib/PropertyValue.js';
import { TaxonMixin } from '../lib/Taxon.js';
import { ThingMixin } from '../lib/Thing.js';

export const BioChemEntityBundle = [
  BioChemEntityMixin as Mixin,
  GeneMixin as Mixin,
  GrantMixin as Mixin,
  MedicalConditionMixin as Mixin,
  PropertyValueMixin as Mixin,
  TaxonMixin as Mixin,
  ThingMixin as Mixin];
