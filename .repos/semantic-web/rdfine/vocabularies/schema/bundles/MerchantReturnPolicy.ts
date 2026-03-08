import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CountryMixin } from '../lib/Country.js';
import { IntangibleMixin } from '../lib/Intangible.js';
import { MerchantReturnPolicyMixin } from '../lib/MerchantReturnPolicy.js';
import { MerchantReturnPolicySeasonalOverrideMixin } from '../lib/MerchantReturnPolicySeasonalOverride.js';
import { MonetaryAmountMixin } from '../lib/MonetaryAmount.js';
import { PropertyValueMixin } from '../lib/PropertyValue.js';

export const MerchantReturnPolicyBundle = [
  CountryMixin as Mixin,
  IntangibleMixin as Mixin,
  MerchantReturnPolicyMixin as Mixin,
  MerchantReturnPolicySeasonalOverrideMixin as Mixin,
  MonetaryAmountMixin as Mixin,
  PropertyValueMixin as Mixin];
