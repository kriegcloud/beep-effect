import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { FollowActionMixin } from '../lib/FollowAction.js';
import { InteractActionMixin } from '../lib/InteractAction.js';
import { OrganizationMixin } from '../lib/Organization.js';
import { PersonMixin } from '../lib/Person.js';

export const FollowActionBundle = [
  FollowActionMixin as Mixin,
  InteractActionMixin as Mixin,
  OrganizationMixin as Mixin,
  PersonMixin as Mixin];
