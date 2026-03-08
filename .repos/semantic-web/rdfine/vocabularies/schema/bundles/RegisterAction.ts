import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { InteractActionMixin } from '../lib/InteractAction.js';
import { RegisterActionMixin } from '../lib/RegisterAction.js';

export const RegisterActionBundle = [
  InteractActionMixin as Mixin,
  RegisterActionMixin as Mixin];
