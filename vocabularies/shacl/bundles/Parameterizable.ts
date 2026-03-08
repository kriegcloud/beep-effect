import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ParameterizableMixin } from '../lib/Parameterizable.js';
import { ParameterMixin } from '../lib/Parameter.js';

export const ParameterizableBundle = [
  ParameterizableMixin as Mixin,
  ParameterMixin as Mixin];
