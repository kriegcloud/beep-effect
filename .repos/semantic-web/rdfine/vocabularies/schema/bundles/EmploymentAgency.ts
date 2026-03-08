import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { EmploymentAgencyMixin } from '../lib/EmploymentAgency.js';
import { LocalBusinessMixin } from '../lib/LocalBusiness.js';

export const EmploymentAgencyBundle = [
  EmploymentAgencyMixin as Mixin,
  LocalBusinessMixin as Mixin];
