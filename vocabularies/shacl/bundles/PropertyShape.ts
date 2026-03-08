import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { PropertyGroupMixin } from '../lib/PropertyGroup.js';
import { PropertyShapeMixin } from '../lib/PropertyShape.js';
import { ShapeMixin } from '../lib/Shape.js';

export const PropertyShapeBundle = [
  PropertyGroupMixin as Mixin,
  PropertyShapeMixin as Mixin,
  ShapeMixin as Mixin];
