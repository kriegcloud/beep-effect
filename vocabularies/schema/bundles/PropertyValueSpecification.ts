import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { IntangibleMixin } from '../lib/Intangible.js';
import { PropertyValueSpecificationMixin } from '../lib/PropertyValueSpecification.js';
import { ThingMixin } from '../lib/Thing.js';

export const PropertyValueSpecificationBundle = [
  IntangibleMixin as Mixin,
  PropertyValueSpecificationMixin as Mixin,
  ThingMixin as Mixin];
