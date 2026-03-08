import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { OrganizationMixin } from '../lib/Organization.js';
import { PersonMixin } from '../lib/Person.js';
import { RealEstateAgentMixin } from '../lib/RealEstateAgent.js';
import { RentActionMixin } from '../lib/RentAction.js';
import { TradeActionMixin } from '../lib/TradeAction.js';

export const RentActionBundle = [
  OrganizationMixin as Mixin,
  PersonMixin as Mixin,
  RealEstateAgentMixin as Mixin,
  RentActionMixin as Mixin,
  TradeActionMixin as Mixin];
