import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { InstantiationMixin } from '../lib/Instantiation.js';
import { ProductionTechniqueTypeMixin } from '../lib/ProductionTechniqueType.js';
import { TypeMixin } from '../lib/Type.js';

export const ProductionTechniqueTypeBundle = [
  InstantiationMixin as Mixin,
  ProductionTechniqueTypeMixin as Mixin,
  TypeMixin as Mixin];
