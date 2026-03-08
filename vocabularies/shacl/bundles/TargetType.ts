import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ParameterizableMixin } from '../lib/Parameterizable.js';
import { TargetTypeMixin } from '../lib/TargetType.js';

export const TargetTypeBundle = [
  ParameterizableMixin as Mixin,
  TargetTypeMixin as Mixin];
