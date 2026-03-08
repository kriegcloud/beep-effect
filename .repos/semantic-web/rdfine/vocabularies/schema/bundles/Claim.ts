import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ClaimMixin } from '../lib/Claim.js';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { OrganizationMixin } from '../lib/Organization.js';
import { PersonMixin } from '../lib/Person.js';

export const ClaimBundle = [
  ClaimMixin as Mixin,
  CreativeWorkMixin as Mixin,
  OrganizationMixin as Mixin,
  PersonMixin as Mixin];
