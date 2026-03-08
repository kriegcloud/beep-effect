import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DurationMixin } from '../lib/Duration.js';
import { QuantitativeValueMixin } from '../lib/QuantitativeValue.js';
import { RealEstateListingMixin } from '../lib/RealEstateListing.js';
import { WebPageMixin } from '../lib/WebPage.js';

export const RealEstateListingBundle = [
  DurationMixin as Mixin,
  QuantitativeValueMixin as Mixin,
  RealEstateListingMixin as Mixin,
  WebPageMixin as Mixin];
