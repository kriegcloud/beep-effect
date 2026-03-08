import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ArticleMixin } from './Article.js';

export interface SatiricalArticle<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Article<D>, rdfine.RdfResource<D> {
}

export function SatiricalArticleMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<SatiricalArticle & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class SatiricalArticleClass extends ArticleMixin(Resource) {
  }
  return SatiricalArticleClass as any
}
SatiricalArticleMixin.appliesTo = schema.SatiricalArticle
SatiricalArticleMixin.createFactory = (env: RdfineEnvironment) => createFactory<SatiricalArticle>([ArticleMixin, SatiricalArticleMixin], { types: [schema.SatiricalArticle] }, env)
