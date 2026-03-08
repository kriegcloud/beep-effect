import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { FunctionMixin } from '../lib/Function.js';
import { SPARQLAskExecutableMixin } from '../lib/SPARQLAskExecutable.js';
import { SPARQLFunctionMixin } from '../lib/SPARQLFunction.js';
import { SPARQLSelectExecutableMixin } from '../lib/SPARQLSelectExecutable.js';

export const SPARQLFunctionBundle = [
  FunctionMixin as Mixin,
  SPARQLAskExecutableMixin as Mixin,
  SPARQLFunctionMixin as Mixin,
  SPARQLSelectExecutableMixin as Mixin];
