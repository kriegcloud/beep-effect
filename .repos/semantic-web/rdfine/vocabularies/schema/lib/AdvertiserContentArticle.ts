import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ArticleMixin } from './Article.js';

export interface AdvertiserContentArticle<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Article<D>, rdfine.RdfResource<D> {
}

export function AdvertiserContentArticleMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<AdvertiserContentArticle & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class AdvertiserContentArticleClass extends ArticleMixin(Resource) {
  }
  return AdvertiserContentArticleClass as any
}
AdvertiserContentArticleMixin.appliesTo = schema.AdvertiserContentArticle
AdvertiserContentArticleMixin.createFactory = (env: RdfineEnvironment) => createFactory<AdvertiserContentArticle>([ArticleMixin, AdvertiserContentArticleMixin], { types: [schema.AdvertiserContentArticle] }, env)
