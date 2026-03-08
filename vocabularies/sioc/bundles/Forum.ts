import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ContainerMixin } from '../lib/Container.js';
import { ForumMixin } from '../lib/Forum.js';
import { UserAccountMixin } from '../lib/UserAccount.js';

export const ForumBundle = [
  ContainerMixin as Mixin,
  ForumMixin as Mixin,
  UserAccountMixin as Mixin];
