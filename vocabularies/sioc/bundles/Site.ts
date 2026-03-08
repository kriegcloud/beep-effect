import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ContainerMixin } from '../lib/Container.js';
import { SiteMixin } from '../lib/Site.js';
import { SpaceMixin } from '../lib/Space.js';
import { UserAccountMixin } from '../lib/UserAccount.js';

export const SiteBundle = [
  ContainerMixin as Mixin,
  SiteMixin as Mixin,
  SpaceMixin as Mixin,
  UserAccountMixin as Mixin];
