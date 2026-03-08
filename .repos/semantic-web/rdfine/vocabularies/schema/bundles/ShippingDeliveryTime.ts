import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { OpeningHoursSpecificationMixin } from '../lib/OpeningHoursSpecification.js';
import { QuantitativeValueMixin } from '../lib/QuantitativeValue.js';
import { ShippingDeliveryTimeMixin } from '../lib/ShippingDeliveryTime.js';
import { StructuredValueMixin } from '../lib/StructuredValue.js';

export const ShippingDeliveryTimeBundle = [
  OpeningHoursSpecificationMixin as Mixin,
  QuantitativeValueMixin as Mixin,
  ShippingDeliveryTimeMixin as Mixin,
  StructuredValueMixin as Mixin];
