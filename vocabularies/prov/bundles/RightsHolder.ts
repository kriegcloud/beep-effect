import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { RightsHolderMixin } from '../lib/RightsHolder.js';
import { RoleMixin } from '../lib/Role.js';

export const RightsHolderBundle = [
  RightsHolderMixin as Mixin,
  RoleMixin as Mixin];
