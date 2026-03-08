import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { PropertyValueMixin } from '../lib/PropertyValue.js';
import { TaxonMixin } from '../lib/Taxon.js';
import { ThingMixin } from '../lib/Thing.js';

export const TaxonBundle = [
  PropertyValueMixin as Mixin,
  TaxonMixin as Mixin,
  ThingMixin as Mixin];
