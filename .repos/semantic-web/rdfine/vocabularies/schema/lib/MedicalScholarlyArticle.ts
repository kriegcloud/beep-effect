import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ScholarlyArticleMixin } from './ScholarlyArticle.js';

export interface MedicalScholarlyArticle<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.ScholarlyArticle<D>, rdfine.RdfResource<D> {
  publicationType: string | undefined;
}

export function MedicalScholarlyArticleMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<MedicalScholarlyArticle & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class MedicalScholarlyArticleClass extends ScholarlyArticleMixin(Resource) {
    @rdfine.property.literal()
    publicationType: string | undefined;
  }
  return MedicalScholarlyArticleClass as any
}
MedicalScholarlyArticleMixin.appliesTo = schema.MedicalScholarlyArticle
MedicalScholarlyArticleMixin.createFactory = (env: RdfineEnvironment) => createFactory<MedicalScholarlyArticle>([ScholarlyArticleMixin, MedicalScholarlyArticleMixin], { types: [schema.MedicalScholarlyArticle] }, env)
