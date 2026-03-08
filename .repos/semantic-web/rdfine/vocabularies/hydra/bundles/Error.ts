import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ErrorMixin } from '../lib/Error.js';
import { StatusMixin } from '../lib/Status.js';

export const ErrorBundle = [
  ErrorMixin as Mixin,
  StatusMixin as Mixin];
