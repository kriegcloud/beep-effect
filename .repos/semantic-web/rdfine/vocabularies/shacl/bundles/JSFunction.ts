import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { FunctionMixin } from '../lib/Function.js';
import { JSExecutableMixin } from '../lib/JSExecutable.js';
import { JSFunctionMixin } from '../lib/JSFunction.js';

export const JSFunctionBundle = [
  FunctionMixin as Mixin,
  JSExecutableMixin as Mixin,
  JSFunctionMixin as Mixin];
