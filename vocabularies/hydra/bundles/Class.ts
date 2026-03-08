import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ClassMixin } from '../lib/Class.js';
import { OperationMixin } from '../lib/Operation.js';

export const ClassBundle = [
  ClassMixin as Mixin,
  OperationMixin as Mixin];
