import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AudienceMixin } from '../lib/Audience.js';
import { ContactPointMixin } from '../lib/ContactPoint.js';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { MessageMixin } from '../lib/Message.js';
import { OrganizationMixin } from '../lib/Organization.js';
import { PersonMixin } from '../lib/Person.js';

export const MessageBundle = [
  AudienceMixin as Mixin,
  ContactPointMixin as Mixin,
  CreativeWorkMixin as Mixin,
  MessageMixin as Mixin,
  OrganizationMixin as Mixin,
  PersonMixin as Mixin];
