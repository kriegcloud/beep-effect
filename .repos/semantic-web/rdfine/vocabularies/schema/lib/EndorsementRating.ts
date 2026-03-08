import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { RatingMixin } from './Rating.js';

export interface EndorsementRating<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Rating<D>, rdfine.RdfResource<D> {
}

export function EndorsementRatingMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<EndorsementRating & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class EndorsementRatingClass extends RatingMixin(Resource) {
  }
  return EndorsementRatingClass as any
}
EndorsementRatingMixin.appliesTo = schema.EndorsementRating
EndorsementRatingMixin.createFactory = (env: RdfineEnvironment) => createFactory<EndorsementRating>([RatingMixin, EndorsementRatingMixin], { types: [schema.EndorsementRating] }, env)
