import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CarrierTypeMixin } from '../lib/CarrierType.js';
import { InstantiationMixin } from '../lib/Instantiation.js';
import { TypeMixin } from '../lib/Type.js';

export const CarrierTypeBundle = [
  CarrierTypeMixin as Mixin,
  InstantiationMixin as Mixin,
  TypeMixin as Mixin];
