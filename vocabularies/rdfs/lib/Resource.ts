import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rdfs } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rdfs from '../index.js';

export interface Resource<D extends RDF.DatasetCore = RDF.DatasetCore> extends rdfine.RdfResource<D> {
  comment: string | undefined;
  isDefinedBy: Rdfs.Resource<D> | undefined;
  label: string | undefined;
  seeAlso: Array<Rdfs.Resource<D>>;
}

export function ResourceMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Resource & RdfResourceCore> & Base {
  @rdfine.namespace(rdfs)
  class ResourceClass extends Resource {
    @rdfine.property.literal()
    comment: string | undefined;
    @rdfine.property.resource({ as: [ResourceMixin] })
    isDefinedBy: Rdfs.Resource | undefined;
    @rdfine.property.literal()
    label: string | undefined;
    @rdfine.property.resource({ values: 'array', as: [ResourceMixin] })
    seeAlso!: Array<Rdfs.Resource>;
  }
  return ResourceClass as any
}
ResourceMixin.appliesTo = rdfs.Resource
ResourceMixin.createFactory = (env: RdfineEnvironment) => createFactory<Resource>([ResourceMixin], { types: [rdfs.Resource] }, env)
