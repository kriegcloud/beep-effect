import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ActivityMixin } from '../lib/Activity.js';
import { AgentMixin } from '../lib/Agent.js';
import { AttributionMixin } from '../lib/Attribution.js';
import { BundleMixin } from '../lib/Bundle.js';
import { DerivationMixin } from '../lib/Derivation.js';
import { EntityMixin } from '../lib/Entity.js';
import { GenerationMixin } from '../lib/Generation.js';
import { InfluenceMixin } from '../lib/Influence.js';
import { InvalidationMixin } from '../lib/Invalidation.js';
import { LocationMixin } from '../lib/Location.js';
import { PrimarySourceMixin } from '../lib/PrimarySource.js';
import { QuotationMixin } from '../lib/Quotation.js';
import { RevisionMixin } from '../lib/Revision.js';

export const EntityBundle = [
  ActivityMixin as Mixin,
  AgentMixin as Mixin,
  AttributionMixin as Mixin,
  BundleMixin as Mixin,
  DerivationMixin as Mixin,
  EntityMixin as Mixin,
  GenerationMixin as Mixin,
  InfluenceMixin as Mixin,
  InvalidationMixin as Mixin,
  LocationMixin as Mixin,
  PrimarySourceMixin as Mixin,
  QuotationMixin as Mixin,
  RevisionMixin as Mixin];
