import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { EventMixin } from '../lib/Event.js';
import { PersonMixin } from '../lib/Person.js';
import { SportsEventMixin } from '../lib/SportsEvent.js';
import { SportsTeamMixin } from '../lib/SportsTeam.js';

export const SportsEventBundle = [
  EventMixin as Mixin,
  PersonMixin as Mixin,
  SportsEventMixin as Mixin,
  SportsTeamMixin as Mixin];
