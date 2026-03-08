import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { sioc } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Sioc from '../index.js';
import { ContainerMixin } from './Container.js';

export interface Thread<D extends RDF.DatasetCore = RDF.DatasetCore> extends Sioc.Container<D>, rdfine.RdfResource<D> {
}

export function ThreadMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Thread & RdfResourceCore> & Base {
  @rdfine.namespace(sioc)
  class ThreadClass extends ContainerMixin(Resource) {
  }
  return ThreadClass as any
}
ThreadMixin.appliesTo = sioc.Thread
ThreadMixin.createFactory = (env: RdfineEnvironment) => createFactory<Thread>([ContainerMixin, ThreadMixin], { types: [sioc.Thread] }, env)
