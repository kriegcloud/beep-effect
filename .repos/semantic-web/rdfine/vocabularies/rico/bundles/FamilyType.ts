import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { FamilyMixin } from '../lib/Family.js';
import { FamilyTypeMixin } from '../lib/FamilyType.js';
import { TypeMixin } from '../lib/Type.js';

export const FamilyTypeBundle = [
  FamilyMixin as Mixin,
  FamilyTypeMixin as Mixin,
  TypeMixin as Mixin];
