import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ArticleMixin } from './Article.js';

export interface ScholarlyArticle<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Article<D>, rdfine.RdfResource<D> {
}

export function ScholarlyArticleMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ScholarlyArticle & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ScholarlyArticleClass extends ArticleMixin(Resource) {
  }
  return ScholarlyArticleClass as any
}
ScholarlyArticleMixin.appliesTo = schema.ScholarlyArticle
ScholarlyArticleMixin.createFactory = (env: RdfineEnvironment) => createFactory<ScholarlyArticle>([ArticleMixin, ScholarlyArticleMixin], { types: [schema.ScholarlyArticle] }, env)
