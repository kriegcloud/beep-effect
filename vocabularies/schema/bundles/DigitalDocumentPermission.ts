import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AudienceMixin } from '../lib/Audience.js';
import { ContactPointMixin } from '../lib/ContactPoint.js';
import { DigitalDocumentPermissionMixin } from '../lib/DigitalDocumentPermission.js';
import { IntangibleMixin } from '../lib/Intangible.js';
import { OrganizationMixin } from '../lib/Organization.js';
import { PersonMixin } from '../lib/Person.js';

export const DigitalDocumentPermissionBundle = [
  AudienceMixin as Mixin,
  ContactPointMixin as Mixin,
  DigitalDocumentPermissionMixin as Mixin,
  IntangibleMixin as Mixin,
  OrganizationMixin as Mixin,
  PersonMixin as Mixin];
