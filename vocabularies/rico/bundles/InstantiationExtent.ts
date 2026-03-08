import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ExtentMixin } from '../lib/Extent.js';
import { InstantiationExtentMixin } from '../lib/InstantiationExtent.js';

export const InstantiationExtentBundle = [
  ExtentMixin as Mixin,
  InstantiationExtentMixin as Mixin];
