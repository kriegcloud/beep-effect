import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { HomeAndConstructionBusinessMixin } from '../lib/HomeAndConstructionBusiness.js';
import { LocksmithMixin } from '../lib/Locksmith.js';

export const LocksmithBundle = [
  HomeAndConstructionBusinessMixin as Mixin,
  LocksmithMixin as Mixin];
