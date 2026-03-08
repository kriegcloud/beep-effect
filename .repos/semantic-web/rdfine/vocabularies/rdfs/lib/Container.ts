import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rdfs } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rdfs from '../index.js';
import { ResourceMixin } from './Resource.js';

export interface Container<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rdfs.Resource<D>, rdfine.RdfResource<D> {
}

export function ContainerMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Container & RdfResourceCore> & Base {
  @rdfine.namespace(rdfs)
  class ContainerClass extends ResourceMixin(Resource) {
  }
  return ContainerClass as any
}
ContainerMixin.appliesTo = rdfs.Container
ContainerMixin.createFactory = (env: RdfineEnvironment) => createFactory<Container>([ResourceMixin, ContainerMixin], { types: [rdfs.Container] }, env)
