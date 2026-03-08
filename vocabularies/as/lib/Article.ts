import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { as } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as As from '../index.js';
import { ObjectMixin } from './Object.js';

export interface Article<D extends RDF.DatasetCore = RDF.DatasetCore> extends As.Object<D>, rdfine.RdfResource<D> {
}

export function ArticleMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Article & RdfResourceCore> & Base {
  @rdfine.namespace(as)
  class ArticleClass extends ObjectMixin(Resource) {
  }
  return ArticleClass as any
}
ArticleMixin.appliesTo = as.Article
ArticleMixin.createFactory = (env: RdfineEnvironment) => createFactory<Article>([ObjectMixin, ArticleMixin], { types: [as.Article] }, env)
