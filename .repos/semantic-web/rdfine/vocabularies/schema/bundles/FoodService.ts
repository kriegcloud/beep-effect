import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { FoodServiceMixin } from '../lib/FoodService.js';
import { ServiceMixin } from '../lib/Service.js';

export const FoodServiceBundle = [
  FoodServiceMixin as Mixin,
  ServiceMixin as Mixin];
