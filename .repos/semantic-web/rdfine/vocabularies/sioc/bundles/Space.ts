import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { SpaceMixin } from '../lib/Space.js';
import { UsergroupMixin } from '../lib/Usergroup.js';

export const SpaceBundle = [
  SpaceMixin as Mixin,
  UsergroupMixin as Mixin];
