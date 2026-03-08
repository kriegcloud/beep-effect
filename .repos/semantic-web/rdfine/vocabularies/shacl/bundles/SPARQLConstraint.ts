import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { SPARQLConstraintMixin } from '../lib/SPARQLConstraint.js';
import { SPARQLSelectExecutableMixin } from '../lib/SPARQLSelectExecutable.js';

export const SPARQLConstraintBundle = [
  SPARQLConstraintMixin as Mixin,
  SPARQLSelectExecutableMixin as Mixin];
