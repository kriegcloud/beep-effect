import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CheckOutActionMixin } from '../lib/CheckOutAction.js';
import { CommunicateActionMixin } from '../lib/CommunicateAction.js';

export const CheckOutActionBundle = [
  CheckOutActionMixin as Mixin,
  CommunicateActionMixin as Mixin];
