import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AdministrativeAreaMixin } from '../lib/AdministrativeArea.js';
import { DeliveryChargeSpecificationMixin } from '../lib/DeliveryChargeSpecification.js';
import { GeoShapeMixin } from '../lib/GeoShape.js';
import { PlaceMixin } from '../lib/Place.js';
import { PriceSpecificationMixin } from '../lib/PriceSpecification.js';

export const DeliveryChargeSpecificationBundle = [
  AdministrativeAreaMixin as Mixin,
  DeliveryChargeSpecificationMixin as Mixin,
  GeoShapeMixin as Mixin,
  PlaceMixin as Mixin,
  PriceSpecificationMixin as Mixin];
