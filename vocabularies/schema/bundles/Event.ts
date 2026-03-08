import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AggregateRatingMixin } from '../lib/AggregateRating.js';
import { AudienceMixin } from '../lib/Audience.js';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { DemandMixin } from '../lib/Demand.js';
import { DurationMixin } from '../lib/Duration.js';
import { EventMixin } from '../lib/Event.js';
import { GrantMixin } from '../lib/Grant.js';
import { LanguageMixin } from '../lib/Language.js';
import { OfferMixin } from '../lib/Offer.js';
import { OrganizationMixin } from '../lib/Organization.js';
import { PersonMixin } from '../lib/Person.js';
import { PlaceMixin } from '../lib/Place.js';
import { PostalAddressMixin } from '../lib/PostalAddress.js';
import { ReviewMixin } from '../lib/Review.js';
import { ScheduleMixin } from '../lib/Schedule.js';
import { ThingMixin } from '../lib/Thing.js';

export const EventBundle = [
  AggregateRatingMixin as Mixin,
  AudienceMixin as Mixin,
  CreativeWorkMixin as Mixin,
  DemandMixin as Mixin,
  DurationMixin as Mixin,
  EventMixin as Mixin,
  GrantMixin as Mixin,
  LanguageMixin as Mixin,
  OfferMixin as Mixin,
  OrganizationMixin as Mixin,
  PersonMixin as Mixin,
  PlaceMixin as Mixin,
  PostalAddressMixin as Mixin,
  ReviewMixin as Mixin,
  ScheduleMixin as Mixin,
  ThingMixin as Mixin];
