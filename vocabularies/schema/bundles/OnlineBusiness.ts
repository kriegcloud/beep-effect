import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { OnlineBusinessMixin } from '../lib/OnlineBusiness.js';
import { OrganizationMixin } from '../lib/Organization.js';

export const OnlineBusinessBundle = [
  OnlineBusinessMixin as Mixin,
  OrganizationMixin as Mixin];
