import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { GovernmentOfficeMixin } from '../lib/GovernmentOffice.js';
import { LocalBusinessMixin } from '../lib/LocalBusiness.js';

export const GovernmentOfficeBundle = [
  GovernmentOfficeMixin as Mixin,
  LocalBusinessMixin as Mixin];
