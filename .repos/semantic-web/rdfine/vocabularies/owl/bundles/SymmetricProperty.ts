import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ObjectPropertyMixin } from '../lib/ObjectProperty.js';
import { SymmetricPropertyMixin } from '../lib/SymmetricProperty.js';

export const SymmetricPropertyBundle = [
  ObjectPropertyMixin as Mixin,
  SymmetricPropertyMixin as Mixin];
