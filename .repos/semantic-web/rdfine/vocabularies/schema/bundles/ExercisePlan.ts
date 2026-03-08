import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { DurationMixin } from '../lib/Duration.js';
import { EnergyMixin } from '../lib/Energy.js';
import { ExercisePlanMixin } from '../lib/ExercisePlan.js';
import { PhysicalActivityMixin } from '../lib/PhysicalActivity.js';
import { QuantitativeValueMixin } from '../lib/QuantitativeValue.js';

export const ExercisePlanBundle = [
  CreativeWorkMixin as Mixin,
  DurationMixin as Mixin,
  EnergyMixin as Mixin,
  ExercisePlanMixin as Mixin,
  PhysicalActivityMixin as Mixin,
  QuantitativeValueMixin as Mixin];
