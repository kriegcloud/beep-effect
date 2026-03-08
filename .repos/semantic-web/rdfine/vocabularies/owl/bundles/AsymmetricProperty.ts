import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AsymmetricPropertyMixin } from '../lib/AsymmetricProperty.js';
import { ObjectPropertyMixin } from '../lib/ObjectProperty.js';

export const AsymmetricPropertyBundle = [
  AsymmetricPropertyMixin as Mixin,
  ObjectPropertyMixin as Mixin];
