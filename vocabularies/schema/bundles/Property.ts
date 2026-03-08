import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { IntangibleMixin } from '../lib/Intangible.js';
import { PropertyMixin } from '../lib/Property.js';

export const PropertyBundle = [
  IntangibleMixin as Mixin,
  PropertyMixin as Mixin];
