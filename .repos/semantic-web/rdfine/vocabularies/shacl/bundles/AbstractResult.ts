import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AbstractResultMixin } from '../lib/AbstractResult.js';
import { ConstraintComponentMixin } from '../lib/ConstraintComponent.js';
import { SeverityMixin } from '../lib/Severity.js';
import { ShapeMixin } from '../lib/Shape.js';

export const AbstractResultBundle = [
  AbstractResultMixin as Mixin,
  ConstraintComponentMixin as Mixin,
  SeverityMixin as Mixin,
  ShapeMixin as Mixin];
