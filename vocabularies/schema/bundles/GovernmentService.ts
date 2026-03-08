import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AdministrativeAreaMixin } from '../lib/AdministrativeArea.js';
import { GovernmentServiceMixin } from '../lib/GovernmentService.js';
import { OrganizationMixin } from '../lib/Organization.js';
import { ServiceMixin } from '../lib/Service.js';

export const GovernmentServiceBundle = [
  AdministrativeAreaMixin as Mixin,
  GovernmentServiceMixin as Mixin,
  OrganizationMixin as Mixin,
  ServiceMixin as Mixin];
