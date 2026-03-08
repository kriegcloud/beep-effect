import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { IdentifierMixin } from '../lib/Identifier.js';
import { IdentifierTypeMixin } from '../lib/IdentifierType.js';
import { TypeMixin } from '../lib/Type.js';

export const IdentifierTypeBundle = [
  IdentifierMixin as Mixin,
  IdentifierTypeMixin as Mixin,
  TypeMixin as Mixin];
