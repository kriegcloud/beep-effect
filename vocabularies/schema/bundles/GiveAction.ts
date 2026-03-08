import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AudienceMixin } from '../lib/Audience.js';
import { ContactPointMixin } from '../lib/ContactPoint.js';
import { GiveActionMixin } from '../lib/GiveAction.js';
import { OrganizationMixin } from '../lib/Organization.js';
import { PersonMixin } from '../lib/Person.js';
import { TransferActionMixin } from '../lib/TransferAction.js';

export const GiveActionBundle = [
  AudienceMixin as Mixin,
  ContactPointMixin as Mixin,
  GiveActionMixin as Mixin,
  OrganizationMixin as Mixin,
  PersonMixin as Mixin,
  TransferActionMixin as Mixin];
