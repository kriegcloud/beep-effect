import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { SPARQLExecutableMixin } from '../lib/SPARQLExecutable.js';
import { SPARQLSelectExecutableMixin } from '../lib/SPARQLSelectExecutable.js';

export const SPARQLSelectExecutableBundle = [
  SPARQLExecutableMixin as Mixin,
  SPARQLSelectExecutableMixin as Mixin];
