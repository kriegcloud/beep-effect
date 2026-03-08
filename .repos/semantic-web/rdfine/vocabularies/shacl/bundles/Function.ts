import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { FunctionMixin } from '../lib/Function.js';
import { ParameterizableMixin } from '../lib/Parameterizable.js';

export const FunctionBundle = [
  FunctionMixin as Mixin,
  ParameterizableMixin as Mixin];
