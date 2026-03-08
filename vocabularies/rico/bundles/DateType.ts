import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DateMixin } from '../lib/Date.js';
import { DateTypeMixin } from '../lib/DateType.js';
import { TypeMixin } from '../lib/Type.js';

export const DateTypeBundle = [
  DateMixin as Mixin,
  DateTypeMixin as Mixin,
  TypeMixin as Mixin];
