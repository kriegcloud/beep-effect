import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { OfferForLeaseMixin } from '../lib/OfferForLease.js';
import { OfferMixin } from '../lib/Offer.js';

export const OfferForLeaseBundle = [
  OfferForLeaseMixin as Mixin,
  OfferMixin as Mixin];
