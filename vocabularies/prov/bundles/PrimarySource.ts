import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DerivationMixin } from '../lib/Derivation.js';
import { PrimarySourceMixin } from '../lib/PrimarySource.js';

export const PrimarySourceBundle = [
  DerivationMixin as Mixin,
  PrimarySourceMixin as Mixin];
