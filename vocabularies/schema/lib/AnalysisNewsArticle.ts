import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { NewsArticleMixin } from './NewsArticle.js';

export interface AnalysisNewsArticle<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.NewsArticle<D>, rdfine.RdfResource<D> {
}

export function AnalysisNewsArticleMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<AnalysisNewsArticle & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class AnalysisNewsArticleClass extends NewsArticleMixin(Resource) {
  }
  return AnalysisNewsArticleClass as any
}
AnalysisNewsArticleMixin.appliesTo = schema.AnalysisNewsArticle
AnalysisNewsArticleMixin.createFactory = (env: RdfineEnvironment) => createFactory<AnalysisNewsArticle>([NewsArticleMixin, AnalysisNewsArticleMixin], { types: [schema.AnalysisNewsArticle] }, env)
