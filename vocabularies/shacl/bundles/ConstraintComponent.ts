import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ConstraintComponentMixin } from '../lib/ConstraintComponent.js';
import { ParameterizableMixin } from '../lib/Parameterizable.js';
import { ValidatorMixin } from '../lib/Validator.js';

export const ConstraintComponentBundle = [
  ConstraintComponentMixin as Mixin,
  ParameterizableMixin as Mixin,
  ValidatorMixin as Mixin];
