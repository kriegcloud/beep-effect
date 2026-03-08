import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ItemListMixin } from './ItemList.js';

export interface BreadcrumbList<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.ItemList<D>, rdfine.RdfResource<D> {
}

export function BreadcrumbListMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<BreadcrumbList & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class BreadcrumbListClass extends ItemListMixin(Resource) {
  }
  return BreadcrumbListClass as any
}
BreadcrumbListMixin.appliesTo = schema.BreadcrumbList
BreadcrumbListMixin.createFactory = (env: RdfineEnvironment) => createFactory<BreadcrumbList>([ItemListMixin, BreadcrumbListMixin], { types: [schema.BreadcrumbList] }, env)
