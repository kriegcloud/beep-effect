import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { GovernmentPermitMixin } from '../lib/GovernmentPermit.js';
import { PermitMixin } from '../lib/Permit.js';

export const GovernmentPermitBundle = [
  GovernmentPermitMixin as Mixin,
  PermitMixin as Mixin];
