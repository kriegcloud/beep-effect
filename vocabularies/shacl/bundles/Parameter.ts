import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ParameterMixin } from '../lib/Parameter.js';
import { PropertyShapeMixin } from '../lib/PropertyShape.js';

export const ParameterBundle = [
  ParameterMixin as Mixin,
  PropertyShapeMixin as Mixin];
