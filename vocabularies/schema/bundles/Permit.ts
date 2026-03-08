import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AdministrativeAreaMixin } from '../lib/AdministrativeArea.js';
import { AudienceMixin } from '../lib/Audience.js';
import { DurationMixin } from '../lib/Duration.js';
import { IntangibleMixin } from '../lib/Intangible.js';
import { OrganizationMixin } from '../lib/Organization.js';
import { PermitMixin } from '../lib/Permit.js';
import { ServiceMixin } from '../lib/Service.js';

export const PermitBundle = [
  AdministrativeAreaMixin as Mixin,
  AudienceMixin as Mixin,
  DurationMixin as Mixin,
  IntangibleMixin as Mixin,
  OrganizationMixin as Mixin,
  PermitMixin as Mixin,
  ServiceMixin as Mixin];
