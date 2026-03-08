import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { hydra } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Hydra from '../index.js';
import type * as Rdf from '@rdfine/rdf';
import { PropertyMixin as RdfPropertyMixin } from '@rdfine/rdf/lib/Property';

export interface IriTemplateMapping<D extends RDF.DatasetCore = RDF.DatasetCore> extends rdfine.RdfResource<D> {
  property: Rdf.Property<D> | undefined;
  required: boolean | undefined;
  variable: string | undefined;
  variableRepresentation: Hydra.VariableRepresentation<D> | undefined;
}

export function IriTemplateMappingMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<IriTemplateMapping & RdfResourceCore> & Base {
  @rdfine.namespace(hydra)
  class IriTemplateMappingClass extends Resource {
    @rdfine.property.resource({ as: [RdfPropertyMixin] })
    property: Rdf.Property | undefined;
    @rdfine.property.literal({ type: Boolean })
    required: boolean | undefined;
    @rdfine.property.literal()
    variable: string | undefined;
    @rdfine.property.resource({ implicitTypes: [hydra.VariableRepresentation] })
    variableRepresentation: Hydra.VariableRepresentation | undefined;
  }
  return IriTemplateMappingClass as any
}
IriTemplateMappingMixin.appliesTo = hydra.IriTemplateMapping
IriTemplateMappingMixin.createFactory = (env: RdfineEnvironment) => createFactory<IriTemplateMapping>([IriTemplateMappingMixin], { types: [hydra.IriTemplateMapping] }, env)
