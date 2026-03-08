import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ContainerMixin } from '../lib/Container.js';
import { ForumMixin } from '../lib/Forum.js';
import { SiteMixin } from '../lib/Site.js';
import { UserAccountMixin } from '../lib/UserAccount.js';
import { UsergroupMixin } from '../lib/Usergroup.js';

export const UserAccountBundle = [
  ContainerMixin as Mixin,
  ForumMixin as Mixin,
  SiteMixin as Mixin,
  UserAccountMixin as Mixin,
  UsergroupMixin as Mixin];
