import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { EntityInfluenceMixin } from '../lib/EntityInfluence.js';
import { EntityMixin } from '../lib/Entity.js';
import { InfluenceMixin } from '../lib/Influence.js';

export const EntityInfluenceBundle = [
  EntityInfluenceMixin as Mixin,
  EntityMixin as Mixin,
  InfluenceMixin as Mixin];
