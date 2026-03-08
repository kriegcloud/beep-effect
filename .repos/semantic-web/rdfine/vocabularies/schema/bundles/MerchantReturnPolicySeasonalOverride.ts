import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { IntangibleMixin } from '../lib/Intangible.js';
import { MerchantReturnPolicySeasonalOverrideMixin } from '../lib/MerchantReturnPolicySeasonalOverride.js';

export const MerchantReturnPolicySeasonalOverrideBundle = [
  IntangibleMixin as Mixin,
  MerchantReturnPolicySeasonalOverrideMixin as Mixin];
