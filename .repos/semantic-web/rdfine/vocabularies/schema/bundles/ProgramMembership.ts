import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { IntangibleMixin } from '../lib/Intangible.js';
import { OrganizationMixin } from '../lib/Organization.js';
import { PersonMixin } from '../lib/Person.js';
import { ProgramMembershipMixin } from '../lib/ProgramMembership.js';
import { QuantitativeValueMixin } from '../lib/QuantitativeValue.js';

export const ProgramMembershipBundle = [
  IntangibleMixin as Mixin,
  OrganizationMixin as Mixin,
  PersonMixin as Mixin,
  ProgramMembershipMixin as Mixin,
  QuantitativeValueMixin as Mixin];
