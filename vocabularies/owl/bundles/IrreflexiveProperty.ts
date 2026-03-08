import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { IrreflexivePropertyMixin } from '../lib/IrreflexiveProperty.js';
import { ObjectPropertyMixin } from '../lib/ObjectProperty.js';

export const IrreflexivePropertyBundle = [
  IrreflexivePropertyMixin as Mixin,
  ObjectPropertyMixin as Mixin];
