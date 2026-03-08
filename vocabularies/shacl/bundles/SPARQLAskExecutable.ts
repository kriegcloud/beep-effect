import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { SPARQLAskExecutableMixin } from '../lib/SPARQLAskExecutable.js';
import { SPARQLExecutableMixin } from '../lib/SPARQLExecutable.js';

export const SPARQLAskExecutableBundle = [
  SPARQLAskExecutableMixin as Mixin,
  SPARQLExecutableMixin as Mixin];
