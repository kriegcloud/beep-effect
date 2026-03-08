import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AudienceMixin } from '../lib/Audience.js';
import { ContactPointMixin } from '../lib/ContactPoint.js';
import { OrganizationMixin } from '../lib/Organization.js';
import { PersonMixin } from '../lib/Person.js';
import { TipActionMixin } from '../lib/TipAction.js';
import { TradeActionMixin } from '../lib/TradeAction.js';

export const TipActionBundle = [
  AudienceMixin as Mixin,
  ContactPointMixin as Mixin,
  OrganizationMixin as Mixin,
  PersonMixin as Mixin,
  TipActionMixin as Mixin,
  TradeActionMixin as Mixin];
