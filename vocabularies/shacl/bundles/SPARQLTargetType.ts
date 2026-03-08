import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { SPARQLAskExecutableMixin } from '../lib/SPARQLAskExecutable.js';
import { SPARQLSelectExecutableMixin } from '../lib/SPARQLSelectExecutable.js';
import { SPARQLTargetTypeMixin } from '../lib/SPARQLTargetType.js';
import { TargetTypeMixin } from '../lib/TargetType.js';

export const SPARQLTargetTypeBundle = [
  SPARQLAskExecutableMixin as Mixin,
  SPARQLSelectExecutableMixin as Mixin,
  SPARQLTargetTypeMixin as Mixin,
  TargetTypeMixin as Mixin];
