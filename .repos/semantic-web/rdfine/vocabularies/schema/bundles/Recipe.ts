import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { DurationMixin } from '../lib/Duration.js';
import { HowToMixin } from '../lib/HowTo.js';
import { ItemListMixin } from '../lib/ItemList.js';
import { NutritionInformationMixin } from '../lib/NutritionInformation.js';
import { QuantitativeValueMixin } from '../lib/QuantitativeValue.js';
import { RecipeMixin } from '../lib/Recipe.js';

export const RecipeBundle = [
  CreativeWorkMixin as Mixin,
  DurationMixin as Mixin,
  HowToMixin as Mixin,
  ItemListMixin as Mixin,
  NutritionInformationMixin as Mixin,
  QuantitativeValueMixin as Mixin,
  RecipeMixin as Mixin];
