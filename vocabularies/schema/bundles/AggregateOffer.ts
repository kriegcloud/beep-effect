import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AggregateOfferMixin } from '../lib/AggregateOffer.js';
import { DemandMixin } from '../lib/Demand.js';
import { OfferMixin } from '../lib/Offer.js';

export const AggregateOfferBundle = [
  AggregateOfferMixin as Mixin,
  DemandMixin as Mixin,
  OfferMixin as Mixin];
