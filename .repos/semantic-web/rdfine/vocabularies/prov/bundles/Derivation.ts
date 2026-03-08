import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ActivityMixin } from '../lib/Activity.js';
import { DerivationMixin } from '../lib/Derivation.js';
import { EntityInfluenceMixin } from '../lib/EntityInfluence.js';
import { GenerationMixin } from '../lib/Generation.js';
import { UsageMixin } from '../lib/Usage.js';

export const DerivationBundle = [
  ActivityMixin as Mixin,
  DerivationMixin as Mixin,
  EntityInfluenceMixin as Mixin,
  GenerationMixin as Mixin,
  UsageMixin as Mixin];
