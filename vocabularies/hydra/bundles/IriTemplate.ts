import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { IriTemplateMappingMixin } from '../lib/IriTemplateMapping.js';
import { IriTemplateMixin } from '../lib/IriTemplate.js';
import { VariableRepresentationMixin } from '../lib/VariableRepresentation.js';

export const IriTemplateBundle = [
  IriTemplateMappingMixin as Mixin,
  IriTemplateMixin as Mixin,
  VariableRepresentationMixin as Mixin];
