import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CheckInActionMixin } from '../lib/CheckInAction.js';
import { CommunicateActionMixin } from '../lib/CommunicateAction.js';

export const CheckInActionBundle = [
  CheckInActionMixin as Mixin,
  CommunicateActionMixin as Mixin];
