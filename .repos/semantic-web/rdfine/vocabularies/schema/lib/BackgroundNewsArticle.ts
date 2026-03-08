import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { NewsArticleMixin } from './NewsArticle.js';

export interface BackgroundNewsArticle<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.NewsArticle<D>, rdfine.RdfResource<D> {
}

export function BackgroundNewsArticleMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<BackgroundNewsArticle & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class BackgroundNewsArticleClass extends NewsArticleMixin(Resource) {
  }
  return BackgroundNewsArticleClass as any
}
BackgroundNewsArticleMixin.appliesTo = schema.BackgroundNewsArticle
BackgroundNewsArticleMixin.createFactory = (env: RdfineEnvironment) => createFactory<BackgroundNewsArticle>([NewsArticleMixin, BackgroundNewsArticleMixin], { types: [schema.BackgroundNewsArticle] }, env)
