import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { OfferForPurchaseMixin } from '../lib/OfferForPurchase.js';
import { OfferMixin } from '../lib/Offer.js';

export const OfferForPurchaseBundle = [
  OfferForPurchaseMixin as Mixin,
  OfferMixin as Mixin];
