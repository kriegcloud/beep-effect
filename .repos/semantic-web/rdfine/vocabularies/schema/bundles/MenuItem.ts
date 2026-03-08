import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DemandMixin } from '../lib/Demand.js';
import { IntangibleMixin } from '../lib/Intangible.js';
import { MenuItemMixin } from '../lib/MenuItem.js';
import { MenuSectionMixin } from '../lib/MenuSection.js';
import { NutritionInformationMixin } from '../lib/NutritionInformation.js';
import { OfferMixin } from '../lib/Offer.js';

export const MenuItemBundle = [
  DemandMixin as Mixin,
  IntangibleMixin as Mixin,
  MenuItemMixin as Mixin,
  MenuSectionMixin as Mixin,
  NutritionInformationMixin as Mixin,
  OfferMixin as Mixin];
