import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ActionMixin } from '../lib/Action.js';
import { EntryPointMixin } from '../lib/EntryPoint.js';
import { OrganizationMixin } from '../lib/Organization.js';
import { PersonMixin } from '../lib/Person.js';
import { PlaceMixin } from '../lib/Place.js';
import { PostalAddressMixin } from '../lib/PostalAddress.js';
import { ThingMixin } from '../lib/Thing.js';

export const ActionBundle = [
  ActionMixin as Mixin,
  EntryPointMixin as Mixin,
  OrganizationMixin as Mixin,
  PersonMixin as Mixin,
  PlaceMixin as Mixin,
  PostalAddressMixin as Mixin,
  ThingMixin as Mixin];
