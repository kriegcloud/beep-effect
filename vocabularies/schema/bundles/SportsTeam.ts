import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { PersonMixin } from '../lib/Person.js';
import { SportsOrganizationMixin } from '../lib/SportsOrganization.js';
import { SportsTeamMixin } from '../lib/SportsTeam.js';

export const SportsTeamBundle = [
  PersonMixin as Mixin,
  SportsOrganizationMixin as Mixin,
  SportsTeamMixin as Mixin];
