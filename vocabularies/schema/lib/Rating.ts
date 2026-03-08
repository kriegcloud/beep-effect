import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { IntangibleMixin } from './Intangible.js';

export interface Rating<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Intangible<D>, rdfine.RdfResource<D> {
  author: Schema.Organization<D> | Schema.Person<D> | undefined;
  bestRating: number | string | undefined;
  ratingExplanation: string | undefined;
  ratingValue: number | string | undefined;
  reviewAspect: string | undefined;
  worstRating: number | string | undefined;
}

export function RatingMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Rating & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class RatingClass extends IntangibleMixin(Resource) {
    @rdfine.property.resource()
    author: Schema.Organization | Schema.Person | undefined;
    @rdfine.property.literal()
    bestRating: number | string | undefined;
    @rdfine.property.literal()
    ratingExplanation: string | undefined;
    @rdfine.property.literal()
    ratingValue: number | string | undefined;
    @rdfine.property.literal()
    reviewAspect: string | undefined;
    @rdfine.property.literal()
    worstRating: number | string | undefined;
  }
  return RatingClass as any
}
RatingMixin.appliesTo = schema.Rating
RatingMixin.createFactory = (env: RdfineEnvironment) => createFactory<Rating>([IntangibleMixin, RatingMixin], { types: [schema.Rating] }, env)
