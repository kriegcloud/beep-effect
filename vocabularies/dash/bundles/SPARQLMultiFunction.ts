import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { MultiFunctionMixin } from '../lib/MultiFunction.js';
import { SPARQLMultiFunctionMixin } from '../lib/SPARQLMultiFunction.js';

export const SPARQLMultiFunctionBundle = [
  MultiFunctionMixin as Mixin,
  SPARQLMultiFunctionMixin as Mixin];
