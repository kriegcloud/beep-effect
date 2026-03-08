import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AudienceMixin } from '../lib/Audience.js';
import { ContactPointMixin } from '../lib/ContactPoint.js';
import { OrganizationMixin } from '../lib/Organization.js';
import { PayActionMixin } from '../lib/PayAction.js';
import { PersonMixin } from '../lib/Person.js';
import { TradeActionMixin } from '../lib/TradeAction.js';

export const PayActionBundle = [
  AudienceMixin as Mixin,
  ContactPointMixin as Mixin,
  OrganizationMixin as Mixin,
  PayActionMixin as Mixin,
  PersonMixin as Mixin,
  TradeActionMixin as Mixin];
