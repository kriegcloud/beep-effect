import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { NodeShapeMixin } from '../lib/NodeShape.js';
import { ShapeMixin } from '../lib/Shape.js';

export const NodeShapeBundle = [
  NodeShapeMixin as Mixin,
  ShapeMixin as Mixin];
