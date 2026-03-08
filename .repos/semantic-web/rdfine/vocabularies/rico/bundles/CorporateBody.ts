import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CorporateBodyMixin } from '../lib/CorporateBody.js';
import { CorporateBodyTypeMixin } from '../lib/CorporateBodyType.js';
import { GroupMixin } from '../lib/Group.js';
import { PersonMixin } from '../lib/Person.js';

export const CorporateBodyBundle = [
  CorporateBodyMixin as Mixin,
  CorporateBodyTypeMixin as Mixin,
  GroupMixin as Mixin,
  PersonMixin as Mixin];
