import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ObjectPropertyMixin } from '../lib/ObjectProperty.js';
import { ReflexivePropertyMixin } from '../lib/ReflexiveProperty.js';

export const ReflexivePropertyBundle = [
  ObjectPropertyMixin as Mixin,
  ReflexivePropertyMixin as Mixin];
