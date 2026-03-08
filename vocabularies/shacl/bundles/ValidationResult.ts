import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AbstractResultMixin } from '../lib/AbstractResult.js';
import { ValidationResultMixin } from '../lib/ValidationResult.js';

export const ValidationResultBundle = [
  AbstractResultMixin as Mixin,
  ValidationResultMixin as Mixin];
