import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AdministrativeAreaMixin } from '../lib/AdministrativeArea.js';
import { AggregateRatingMixin } from '../lib/AggregateRating.js';
import { AudienceMixin } from '../lib/Audience.js';
import { BrandMixin } from '../lib/Brand.js';
import { CategoryCodeMixin } from '../lib/CategoryCode.js';
import { DemandMixin } from '../lib/Demand.js';
import { GeoShapeMixin } from '../lib/GeoShape.js';
import { ImageObjectMixin } from '../lib/ImageObject.js';
import { IntangibleMixin } from '../lib/Intangible.js';
import { OfferCatalogMixin } from '../lib/OfferCatalog.js';
import { OfferMixin } from '../lib/Offer.js';
import { OpeningHoursSpecificationMixin } from '../lib/OpeningHoursSpecification.js';
import { OrganizationMixin } from '../lib/Organization.js';
import { PersonMixin } from '../lib/Person.js';
import { PlaceMixin } from '../lib/Place.js';
import { ProductMixin } from '../lib/Product.js';
import { ReviewMixin } from '../lib/Review.js';
import { ServiceChannelMixin } from '../lib/ServiceChannel.js';
import { ServiceMixin } from '../lib/Service.js';
import { ThingMixin } from '../lib/Thing.js';

export const ServiceBundle = [
  AdministrativeAreaMixin as Mixin,
  AggregateRatingMixin as Mixin,
  AudienceMixin as Mixin,
  BrandMixin as Mixin,
  CategoryCodeMixin as Mixin,
  DemandMixin as Mixin,
  GeoShapeMixin as Mixin,
  ImageObjectMixin as Mixin,
  IntangibleMixin as Mixin,
  OfferCatalogMixin as Mixin,
  OfferMixin as Mixin,
  OpeningHoursSpecificationMixin as Mixin,
  OrganizationMixin as Mixin,
  PersonMixin as Mixin,
  PlaceMixin as Mixin,
  ProductMixin as Mixin,
  ReviewMixin as Mixin,
  ServiceChannelMixin as Mixin,
  ServiceMixin as Mixin,
  ThingMixin as Mixin];
