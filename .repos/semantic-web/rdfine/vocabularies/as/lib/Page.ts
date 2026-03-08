import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { as } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as As from '../index.js';
import { ObjectMixin } from './Object.js';

export interface Page<D extends RDF.DatasetCore = RDF.DatasetCore> extends As.Object<D>, rdfine.RdfResource<D> {
}

export function PageMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Page & RdfResourceCore> & Base {
  @rdfine.namespace(as)
  class PageClass extends ObjectMixin(Resource) {
  }
  return PageClass as any
}
PageMixin.appliesTo = as.Page
PageMixin.createFactory = (env: RdfineEnvironment) => createFactory<Page>([ObjectMixin, PageMixin], { types: [as.Page] }, env)
