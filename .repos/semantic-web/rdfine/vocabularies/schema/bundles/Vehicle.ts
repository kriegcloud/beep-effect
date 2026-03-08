import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { EngineSpecificationMixin } from '../lib/EngineSpecification.js';
import { ProductMixin } from '../lib/Product.js';
import { QuantitativeValueMixin } from '../lib/QuantitativeValue.js';
import { VehicleMixin } from '../lib/Vehicle.js';

export const VehicleBundle = [
  EngineSpecificationMixin as Mixin,
  ProductMixin as Mixin,
  QuantitativeValueMixin as Mixin,
  VehicleMixin as Mixin];
