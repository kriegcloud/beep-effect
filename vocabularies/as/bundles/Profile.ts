import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ObjectMixin } from '../lib/Object.js';
import { ProfileMixin } from '../lib/Profile.js';

export const ProfileBundle = [
  ObjectMixin as Mixin,
  ProfileMixin as Mixin];
