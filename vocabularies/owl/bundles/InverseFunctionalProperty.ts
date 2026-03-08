import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { InverseFunctionalPropertyMixin } from '../lib/InverseFunctionalProperty.js';
import { ObjectPropertyMixin } from '../lib/ObjectProperty.js';

export const InverseFunctionalPropertyBundle = [
  InverseFunctionalPropertyMixin as Mixin,
  ObjectPropertyMixin as Mixin];
