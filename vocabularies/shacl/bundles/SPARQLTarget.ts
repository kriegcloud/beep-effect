import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { SPARQLAskExecutableMixin } from '../lib/SPARQLAskExecutable.js';
import { SPARQLSelectExecutableMixin } from '../lib/SPARQLSelectExecutable.js';
import { SPARQLTargetMixin } from '../lib/SPARQLTarget.js';
import { TargetMixin } from '../lib/Target.js';

export const SPARQLTargetBundle = [
  SPARQLAskExecutableMixin as Mixin,
  SPARQLSelectExecutableMixin as Mixin,
  SPARQLTargetMixin as Mixin,
  TargetMixin as Mixin];
