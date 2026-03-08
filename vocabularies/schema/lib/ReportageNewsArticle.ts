import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { NewsArticleMixin } from './NewsArticle.js';

export interface ReportageNewsArticle<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.NewsArticle<D>, rdfine.RdfResource<D> {
}

export function ReportageNewsArticleMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ReportageNewsArticle & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ReportageNewsArticleClass extends NewsArticleMixin(Resource) {
  }
  return ReportageNewsArticleClass as any
}
ReportageNewsArticleMixin.appliesTo = schema.ReportageNewsArticle
ReportageNewsArticleMixin.createFactory = (env: RdfineEnvironment) => createFactory<ReportageNewsArticle>([NewsArticleMixin, ReportageNewsArticleMixin], { types: [schema.ReportageNewsArticle] }, env)
