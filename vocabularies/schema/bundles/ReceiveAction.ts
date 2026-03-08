import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AudienceMixin } from '../lib/Audience.js';
import { OrganizationMixin } from '../lib/Organization.js';
import { PersonMixin } from '../lib/Person.js';
import { ReceiveActionMixin } from '../lib/ReceiveAction.js';
import { TransferActionMixin } from '../lib/TransferAction.js';

export const ReceiveActionBundle = [
  AudienceMixin as Mixin,
  OrganizationMixin as Mixin,
  PersonMixin as Mixin,
  ReceiveActionMixin as Mixin,
  TransferActionMixin as Mixin];
