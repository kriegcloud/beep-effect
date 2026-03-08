import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { DurationMixin } from '../lib/Duration.js';
import { HowToMixin } from '../lib/HowTo.js';
import { HowToSectionMixin } from '../lib/HowToSection.js';
import { HowToStepMixin } from '../lib/HowToStep.js';
import { HowToSupplyMixin } from '../lib/HowToSupply.js';
import { HowToToolMixin } from '../lib/HowToTool.js';
import { ItemListMixin } from '../lib/ItemList.js';
import { MonetaryAmountMixin } from '../lib/MonetaryAmount.js';
import { QuantitativeValueMixin } from '../lib/QuantitativeValue.js';

export const HowToBundle = [
  CreativeWorkMixin as Mixin,
  DurationMixin as Mixin,
  HowToMixin as Mixin,
  HowToSectionMixin as Mixin,
  HowToStepMixin as Mixin,
  HowToSupplyMixin as Mixin,
  HowToToolMixin as Mixin,
  ItemListMixin as Mixin,
  MonetaryAmountMixin as Mixin,
  QuantitativeValueMixin as Mixin];
