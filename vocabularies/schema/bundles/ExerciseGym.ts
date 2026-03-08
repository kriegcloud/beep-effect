import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ExerciseGymMixin } from '../lib/ExerciseGym.js';
import { SportsActivityLocationMixin } from '../lib/SportsActivityLocation.js';

export const ExerciseGymBundle = [
  ExerciseGymMixin as Mixin,
  SportsActivityLocationMixin as Mixin];
