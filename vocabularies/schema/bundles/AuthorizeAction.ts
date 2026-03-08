import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AllocateActionMixin } from '../lib/AllocateAction.js';
import { AudienceMixin } from '../lib/Audience.js';
import { AuthorizeActionMixin } from '../lib/AuthorizeAction.js';
import { ContactPointMixin } from '../lib/ContactPoint.js';
import { OrganizationMixin } from '../lib/Organization.js';
import { PersonMixin } from '../lib/Person.js';

export const AuthorizeActionBundle = [
  AllocateActionMixin as Mixin,
  AudienceMixin as Mixin,
  AuthorizeActionMixin as Mixin,
  ContactPointMixin as Mixin,
  OrganizationMixin as Mixin,
  PersonMixin as Mixin];
