import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { AssessActionMixin } from './AssessAction.js';

export interface ReviewAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.AssessAction<D>, rdfine.RdfResource<D> {
  resultReview: Schema.Review<D> | undefined;
}

export function ReviewActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ReviewAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ReviewActionClass extends AssessActionMixin(Resource) {
    @rdfine.property.resource()
    resultReview: Schema.Review | undefined;
  }
  return ReviewActionClass as any
}
ReviewActionMixin.appliesTo = schema.ReviewAction
ReviewActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<ReviewAction>([AssessActionMixin, ReviewActionMixin], { types: [schema.ReviewAction] }, env)
