import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AppellationMixin } from '../lib/Appellation.js';
import { IdentifierMixin } from '../lib/Identifier.js';
import { IdentifierTypeMixin } from '../lib/IdentifierType.js';
import { ThingMixin } from '../lib/Thing.js';

export const IdentifierBundle = [
  AppellationMixin as Mixin,
  IdentifierMixin as Mixin,
  IdentifierTypeMixin as Mixin,
  ThingMixin as Mixin];
