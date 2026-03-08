import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { IntangibleMixin } from '../lib/Intangible.js';
import { MediaSubscriptionMixin } from '../lib/MediaSubscription.js';
import { OfferMixin } from '../lib/Offer.js';
import { OrganizationMixin } from '../lib/Organization.js';

export const MediaSubscriptionBundle = [
  IntangibleMixin as Mixin,
  MediaSubscriptionMixin as Mixin,
  OfferMixin as Mixin,
  OrganizationMixin as Mixin];
