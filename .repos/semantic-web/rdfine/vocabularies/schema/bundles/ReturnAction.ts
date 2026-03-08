import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AudienceMixin } from '../lib/Audience.js';
import { ContactPointMixin } from '../lib/ContactPoint.js';
import { OrganizationMixin } from '../lib/Organization.js';
import { PersonMixin } from '../lib/Person.js';
import { ReturnActionMixin } from '../lib/ReturnAction.js';
import { TransferActionMixin } from '../lib/TransferAction.js';

export const ReturnActionBundle = [
  AudienceMixin as Mixin,
  ContactPointMixin as Mixin,
  OrganizationMixin as Mixin,
  PersonMixin as Mixin,
  ReturnActionMixin as Mixin,
  TransferActionMixin as Mixin];
