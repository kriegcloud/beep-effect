import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { hydra } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Hydra from '../index.js';

export interface IriTemplate<D extends RDF.DatasetCore = RDF.DatasetCore> extends rdfine.RdfResource<D> {
  mapping: Array<Hydra.IriTemplateMapping<D>>;
  resolveRelativeUsing: RDF.NamedNode | undefined;
  template: string | undefined;
  variableRepresentation: Hydra.VariableRepresentation<D> | undefined;
}

export function IriTemplateMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<IriTemplate & RdfResourceCore> & Base {
  @rdfine.namespace(hydra)
  class IriTemplateClass extends Resource {
    @rdfine.property.resource({ values: 'array', implicitTypes: [hydra.IriTemplateMapping] })
    mapping!: Array<Hydra.IriTemplateMapping>;
    @rdfine.property()
    resolveRelativeUsing: RDF.NamedNode | undefined;
    @rdfine.property.literal({ datatype: $rdf.namedNode('http://www.w3.org/ns/hydra/core#Rfc6570Template') })
    template: string | undefined;
    @rdfine.property.resource({ implicitTypes: [hydra.VariableRepresentation] })
    variableRepresentation: Hydra.VariableRepresentation | undefined;
  }
  return IriTemplateClass as any
}
IriTemplateMixin.appliesTo = hydra.IriTemplate
IriTemplateMixin.createFactory = (env: RdfineEnvironment) => createFactory<IriTemplate>([IriTemplateMixin], { types: [hydra.IriTemplate] }, env)
