import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { LanguageMixin } from '../lib/Language.js';
import { LinkRoleMixin } from '../lib/LinkRole.js';
import { RoleMixin } from '../lib/Role.js';

export const LinkRoleBundle = [
  LanguageMixin as Mixin,
  LinkRoleMixin as Mixin,
  RoleMixin as Mixin];
