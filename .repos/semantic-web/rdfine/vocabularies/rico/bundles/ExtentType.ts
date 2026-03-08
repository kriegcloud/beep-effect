import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ExtentMixin } from '../lib/Extent.js';
import { ExtentTypeMixin } from '../lib/ExtentType.js';
import { TypeMixin } from '../lib/Type.js';

export const ExtentTypeBundle = [
  ExtentMixin as Mixin,
  ExtentTypeMixin as Mixin,
  TypeMixin as Mixin];
