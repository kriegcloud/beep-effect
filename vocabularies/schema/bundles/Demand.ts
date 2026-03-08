import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AdministrativeAreaMixin } from '../lib/AdministrativeArea.js';
import { AggregateOfferMixin } from '../lib/AggregateOffer.js';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { DemandMixin } from '../lib/Demand.js';
import { EventMixin } from '../lib/Event.js';
import { GeoShapeMixin } from '../lib/GeoShape.js';
import { IntangibleMixin } from '../lib/Intangible.js';
import { LoanOrCreditMixin } from '../lib/LoanOrCredit.js';
import { MenuItemMixin } from '../lib/MenuItem.js';
import { OrganizationMixin } from '../lib/Organization.js';
import { PersonMixin } from '../lib/Person.js';
import { PlaceMixin } from '../lib/Place.js';
import { PriceSpecificationMixin } from '../lib/PriceSpecification.js';
import { ProductMixin } from '../lib/Product.js';
import { QuantitativeValueMixin } from '../lib/QuantitativeValue.js';
import { ServiceMixin } from '../lib/Service.js';
import { TripMixin } from '../lib/Trip.js';
import { TypeAndQuantityNodeMixin } from '../lib/TypeAndQuantityNode.js';
import { WarrantyPromiseMixin } from '../lib/WarrantyPromise.js';

export const DemandBundle = [
  AdministrativeAreaMixin as Mixin,
  AggregateOfferMixin as Mixin,
  CreativeWorkMixin as Mixin,
  DemandMixin as Mixin,
  EventMixin as Mixin,
  GeoShapeMixin as Mixin,
  IntangibleMixin as Mixin,
  LoanOrCreditMixin as Mixin,
  MenuItemMixin as Mixin,
  OrganizationMixin as Mixin,
  PersonMixin as Mixin,
  PlaceMixin as Mixin,
  PriceSpecificationMixin as Mixin,
  ProductMixin as Mixin,
  QuantitativeValueMixin as Mixin,
  ServiceMixin as Mixin,
  TripMixin as Mixin,
  TypeAndQuantityNodeMixin as Mixin,
  WarrantyPromiseMixin as Mixin];
