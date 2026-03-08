import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CreationRelationMixin } from '../lib/CreationRelation.js';
import { RoleTypeMixin } from '../lib/RoleType.js';
import { TypeMixin } from '../lib/Type.js';

export const RoleTypeBundle = [
  CreationRelationMixin as Mixin,
  RoleTypeMixin as Mixin,
  TypeMixin as Mixin];
