import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { HomeAndConstructionBusinessMixin } from '../lib/HomeAndConstructionBusiness.js';
import { HousePainterMixin } from '../lib/HousePainter.js';

export const HousePainterBundle = [
  HomeAndConstructionBusinessMixin as Mixin,
  HousePainterMixin as Mixin];
