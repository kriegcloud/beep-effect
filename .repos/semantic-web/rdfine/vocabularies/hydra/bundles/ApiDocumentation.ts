import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ApiDocumentationMixin } from '../lib/ApiDocumentation.js';
import { ClassMixin } from '../lib/Class.js';
import { ResourceMixin } from '../lib/Resource.js';
import { StatusMixin } from '../lib/Status.js';

export const ApiDocumentationBundle = [
  ApiDocumentationMixin as Mixin,
  ClassMixin as Mixin,
  ResourceMixin as Mixin,
  StatusMixin as Mixin];
