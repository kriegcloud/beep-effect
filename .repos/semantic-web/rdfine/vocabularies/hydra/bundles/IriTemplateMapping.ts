import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { IriTemplateMappingMixin } from '../lib/IriTemplateMapping.js';
import { VariableRepresentationMixin } from '../lib/VariableRepresentation.js';

export const IriTemplateMappingBundle = [
  IriTemplateMappingMixin as Mixin,
  VariableRepresentationMixin as Mixin];
