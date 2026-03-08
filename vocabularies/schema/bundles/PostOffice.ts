import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { GovernmentOfficeMixin } from '../lib/GovernmentOffice.js';
import { PostOfficeMixin } from '../lib/PostOffice.js';

export const PostOfficeBundle = [
  GovernmentOfficeMixin as Mixin,
  PostOfficeMixin as Mixin];
