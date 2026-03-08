import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ContactPointMixin } from '../lib/ContactPoint.js';
import { CountryMixin } from '../lib/Country.js';
import { PostalAddressMixin } from '../lib/PostalAddress.js';

export const PostalAddressBundle = [
  ContactPointMixin as Mixin,
  CountryMixin as Mixin,
  PostalAddressMixin as Mixin];
