import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { SpaceMixin } from '../lib/Space.js';
import { UserAccountMixin } from '../lib/UserAccount.js';
import { UsergroupMixin } from '../lib/Usergroup.js';

export const UsergroupBundle = [
  SpaceMixin as Mixin,
  UserAccountMixin as Mixin,
  UsergroupMixin as Mixin];
