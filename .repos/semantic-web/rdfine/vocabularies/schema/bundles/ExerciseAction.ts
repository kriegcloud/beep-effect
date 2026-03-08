import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DietMixin } from '../lib/Diet.js';
import { DistanceMixin } from '../lib/Distance.js';
import { ExerciseActionMixin } from '../lib/ExerciseAction.js';
import { ExercisePlanMixin } from '../lib/ExercisePlan.js';
import { PersonMixin } from '../lib/Person.js';
import { PlaceMixin } from '../lib/Place.js';
import { PlayActionMixin } from '../lib/PlayAction.js';
import { SportsActivityLocationMixin } from '../lib/SportsActivityLocation.js';
import { SportsEventMixin } from '../lib/SportsEvent.js';
import { SportsTeamMixin } from '../lib/SportsTeam.js';

export const ExerciseActionBundle = [
  DietMixin as Mixin,
  DistanceMixin as Mixin,
  ExerciseActionMixin as Mixin,
  ExercisePlanMixin as Mixin,
  PersonMixin as Mixin,
  PlaceMixin as Mixin,
  PlayActionMixin as Mixin,
  SportsActivityLocationMixin as Mixin,
  SportsEventMixin as Mixin,
  SportsTeamMixin as Mixin];
