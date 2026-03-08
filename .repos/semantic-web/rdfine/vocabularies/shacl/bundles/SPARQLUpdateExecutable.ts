import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { SPARQLExecutableMixin } from '../lib/SPARQLExecutable.js';
import { SPARQLUpdateExecutableMixin } from '../lib/SPARQLUpdateExecutable.js';

export const SPARQLUpdateExecutableBundle = [
  SPARQLExecutableMixin as Mixin,
  SPARQLUpdateExecutableMixin as Mixin];
