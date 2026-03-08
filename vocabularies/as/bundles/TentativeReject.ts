import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { RejectMixin } from '../lib/Reject.js';
import { TentativeRejectMixin } from '../lib/TentativeReject.js';

export const TentativeRejectBundle = [
  RejectMixin as Mixin,
  TentativeRejectMixin as Mixin];
