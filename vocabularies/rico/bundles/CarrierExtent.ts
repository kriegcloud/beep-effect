import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CarrierExtentMixin } from '../lib/CarrierExtent.js';
import { ExtentMixin } from '../lib/Extent.js';

export const CarrierExtentBundle = [
  CarrierExtentMixin as Mixin,
  ExtentMixin as Mixin];
