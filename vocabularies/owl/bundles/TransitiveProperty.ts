import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ObjectPropertyMixin } from '../lib/ObjectProperty.js';
import { TransitivePropertyMixin } from '../lib/TransitiveProperty.js';

export const TransitivePropertyBundle = [
  ObjectPropertyMixin as Mixin,
  TransitivePropertyMixin as Mixin];
