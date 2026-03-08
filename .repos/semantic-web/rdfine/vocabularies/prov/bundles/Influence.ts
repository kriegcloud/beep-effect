import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ActivityMixin } from '../lib/Activity.js';
import { InfluenceMixin } from '../lib/Influence.js';
import { RoleMixin } from '../lib/Role.js';

export const InfluenceBundle = [
  ActivityMixin as Mixin,
  InfluenceMixin as Mixin,
  RoleMixin as Mixin];
