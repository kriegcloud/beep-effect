import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ArticleMixin } from './Article.js';

export interface TechArticle<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Article<D>, rdfine.RdfResource<D> {
  dependencies: string | undefined;
  proficiencyLevel: string | undefined;
}

export function TechArticleMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<TechArticle & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class TechArticleClass extends ArticleMixin(Resource) {
    @rdfine.property.literal()
    dependencies: string | undefined;
    @rdfine.property.literal()
    proficiencyLevel: string | undefined;
  }
  return TechArticleClass as any
}
TechArticleMixin.appliesTo = schema.TechArticle
TechArticleMixin.createFactory = (env: RdfineEnvironment) => createFactory<TechArticle>([ArticleMixin, TechArticleMixin], { types: [schema.TechArticle] }, env)
