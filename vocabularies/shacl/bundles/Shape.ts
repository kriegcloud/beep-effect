import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { NodeShapeMixin } from '../lib/NodeShape.js';
import { PropertyShapeMixin } from '../lib/PropertyShape.js';
import { RuleMixin } from '../lib/Rule.js';
import { SeverityMixin } from '../lib/Severity.js';
import { ShapeMixin } from '../lib/Shape.js';
import { SPARQLConstraintMixin } from '../lib/SPARQLConstraint.js';
import { TargetMixin } from '../lib/Target.js';

export const ShapeBundle = [
  NodeShapeMixin as Mixin,
  PropertyShapeMixin as Mixin,
  RuleMixin as Mixin,
  SeverityMixin as Mixin,
  ShapeMixin as Mixin,
  SPARQLConstraintMixin as Mixin,
  TargetMixin as Mixin];
