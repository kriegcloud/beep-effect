import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ArticleMixin } from './Article.js';

export interface NewsArticle<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Article<D>, rdfine.RdfResource<D> {
  dateline: string | undefined;
  printColumn: string | undefined;
  printEdition: string | undefined;
  printPage: string | undefined;
  printSection: string | undefined;
}

export function NewsArticleMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<NewsArticle & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class NewsArticleClass extends ArticleMixin(Resource) {
    @rdfine.property.literal()
    dateline: string | undefined;
    @rdfine.property.literal()
    printColumn: string | undefined;
    @rdfine.property.literal()
    printEdition: string | undefined;
    @rdfine.property.literal()
    printPage: string | undefined;
    @rdfine.property.literal()
    printSection: string | undefined;
  }
  return NewsArticleClass as any
}
NewsArticleMixin.appliesTo = schema.NewsArticle
NewsArticleMixin.createFactory = (env: RdfineEnvironment) => createFactory<NewsArticle>([ArticleMixin, NewsArticleMixin], { types: [schema.NewsArticle] }, env)
