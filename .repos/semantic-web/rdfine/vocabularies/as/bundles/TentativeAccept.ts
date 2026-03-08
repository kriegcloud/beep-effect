import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AcceptMixin } from '../lib/Accept.js';
import { TentativeAcceptMixin } from '../lib/TentativeAccept.js';

export const TentativeAcceptBundle = [
  AcceptMixin as Mixin,
  TentativeAcceptMixin as Mixin];
