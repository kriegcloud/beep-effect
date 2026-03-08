import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ReviewMixin } from './Review.js';

export interface EmployerReview<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Review<D>, rdfine.RdfResource<D> {
}

export function EmployerReviewMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<EmployerReview & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class EmployerReviewClass extends ReviewMixin(Resource) {
  }
  return EmployerReviewClass as any
}
EmployerReviewMixin.appliesTo = schema.EmployerReview
EmployerReviewMixin.createFactory = (env: RdfineEnvironment) => createFactory<EmployerReview>([ReviewMixin, EmployerReviewMixin], { types: [schema.EmployerReview] }, env)
