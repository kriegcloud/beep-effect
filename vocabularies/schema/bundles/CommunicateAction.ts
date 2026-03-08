import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AudienceMixin } from '../lib/Audience.js';
import { CommunicateActionMixin } from '../lib/CommunicateAction.js';
import { ContactPointMixin } from '../lib/ContactPoint.js';
import { InteractActionMixin } from '../lib/InteractAction.js';
import { LanguageMixin } from '../lib/Language.js';
import { OrganizationMixin } from '../lib/Organization.js';
import { PersonMixin } from '../lib/Person.js';
import { ThingMixin } from '../lib/Thing.js';

export const CommunicateActionBundle = [
  AudienceMixin as Mixin,
  CommunicateActionMixin as Mixin,
  ContactPointMixin as Mixin,
  InteractActionMixin as Mixin,
  LanguageMixin as Mixin,
  OrganizationMixin as Mixin,
  PersonMixin as Mixin,
  ThingMixin as Mixin];
