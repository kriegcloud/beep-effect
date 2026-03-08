import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AggregateRatingMixin } from '../lib/AggregateRating.js';
import { EmployerAggregateRatingMixin } from '../lib/EmployerAggregateRating.js';

export const EmployerAggregateRatingBundle = [
  AggregateRatingMixin as Mixin,
  EmployerAggregateRatingMixin as Mixin];
