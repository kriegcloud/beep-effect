import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CorporateBodyMixin } from '../lib/CorporateBody.js';
import { CorporateBodyTypeMixin } from '../lib/CorporateBodyType.js';
import { TypeMixin } from '../lib/Type.js';

export const CorporateBodyTypeBundle = [
  CorporateBodyMixin as Mixin,
  CorporateBodyTypeMixin as Mixin,
  TypeMixin as Mixin];
