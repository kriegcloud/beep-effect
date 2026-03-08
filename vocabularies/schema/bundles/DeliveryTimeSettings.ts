import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DefinedRegionMixin } from '../lib/DefinedRegion.js';
import { DeliveryTimeSettingsMixin } from '../lib/DeliveryTimeSettings.js';
import { ShippingDeliveryTimeMixin } from '../lib/ShippingDeliveryTime.js';
import { StructuredValueMixin } from '../lib/StructuredValue.js';

export const DeliveryTimeSettingsBundle = [
  DefinedRegionMixin as Mixin,
  DeliveryTimeSettingsMixin as Mixin,
  ShippingDeliveryTimeMixin as Mixin,
  StructuredValueMixin as Mixin];
