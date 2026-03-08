import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DemandMixin } from '../lib/Demand.js';
import { IntangibleMixin } from '../lib/Intangible.js';
import { ItemListMixin } from '../lib/ItemList.js';
import { OfferMixin } from '../lib/Offer.js';
import { OrganizationMixin } from '../lib/Organization.js';
import { PersonMixin } from '../lib/Person.js';
import { PlaceMixin } from '../lib/Place.js';
import { TripMixin } from '../lib/Trip.js';

export const TripBundle = [
  DemandMixin as Mixin,
  IntangibleMixin as Mixin,
  ItemListMixin as Mixin,
  OfferMixin as Mixin,
  OrganizationMixin as Mixin,
  PersonMixin as Mixin,
  PlaceMixin as Mixin,
  TripMixin as Mixin];
