import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DefinedRegionMixin } from '../lib/DefinedRegion.js';
import { DeliveryChargeSpecificationMixin } from '../lib/DeliveryChargeSpecification.js';
import { MonetaryAmountMixin } from '../lib/MonetaryAmount.js';
import { ShippingRateSettingsMixin } from '../lib/ShippingRateSettings.js';
import { StructuredValueMixin } from '../lib/StructuredValue.js';

export const ShippingRateSettingsBundle = [
  DefinedRegionMixin as Mixin,
  DeliveryChargeSpecificationMixin as Mixin,
  MonetaryAmountMixin as Mixin,
  ShippingRateSettingsMixin as Mixin,
  StructuredValueMixin as Mixin];
