import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AudienceMixin } from '../lib/Audience.js';
import { ContactPointMixin } from '../lib/ContactPoint.js';
import { DonateActionMixin } from '../lib/DonateAction.js';
import { OrganizationMixin } from '../lib/Organization.js';
import { PersonMixin } from '../lib/Person.js';
import { TradeActionMixin } from '../lib/TradeAction.js';

export const DonateActionBundle = [
  AudienceMixin as Mixin,
  ContactPointMixin as Mixin,
  DonateActionMixin as Mixin,
  OrganizationMixin as Mixin,
  PersonMixin as Mixin,
  TradeActionMixin as Mixin];
