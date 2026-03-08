import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { JSConstraintMixin } from '../lib/JSConstraint.js';
import { JSExecutableMixin } from '../lib/JSExecutable.js';

export const JSConstraintBundle = [
  JSConstraintMixin as Mixin,
  JSExecutableMixin as Mixin];
