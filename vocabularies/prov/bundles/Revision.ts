import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DerivationMixin } from '../lib/Derivation.js';
import { RevisionMixin } from '../lib/Revision.js';

export const RevisionBundle = [
  DerivationMixin as Mixin,
  RevisionMixin as Mixin];
