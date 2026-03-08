import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { SPARQLConstructExecutableMixin } from '../lib/SPARQLConstructExecutable.js';
import { SPARQLExecutableMixin } from '../lib/SPARQLExecutable.js';

export const SPARQLConstructExecutableBundle = [
  SPARQLConstructExecutableMixin as Mixin,
  SPARQLExecutableMixin as Mixin];
