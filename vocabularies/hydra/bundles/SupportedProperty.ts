import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { OperationMixin } from '../lib/Operation.js';
import { SupportedPropertyMixin } from '../lib/SupportedProperty.js';

export const SupportedPropertyBundle = [
  OperationMixin as Mixin,
  SupportedPropertyMixin as Mixin];
