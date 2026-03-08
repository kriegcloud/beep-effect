import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ContactPointMixin } from '../lib/ContactPoint.js';
import { DurationMixin } from '../lib/Duration.js';
import { IntangibleMixin } from '../lib/Intangible.js';
import { LanguageMixin } from '../lib/Language.js';
import { PlaceMixin } from '../lib/Place.js';
import { PostalAddressMixin } from '../lib/PostalAddress.js';
import { ServiceChannelMixin } from '../lib/ServiceChannel.js';
import { ServiceMixin } from '../lib/Service.js';

export const ServiceChannelBundle = [
  ContactPointMixin as Mixin,
  DurationMixin as Mixin,
  IntangibleMixin as Mixin,
  LanguageMixin as Mixin,
  PlaceMixin as Mixin,
  PostalAddressMixin as Mixin,
  ServiceChannelMixin as Mixin,
  ServiceMixin as Mixin];
