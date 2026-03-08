import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ReviewMixin } from './Review.js';

export interface Recommendation<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Review<D>, rdfine.RdfResource<D> {
  category: Schema.CategoryCode<D> | Schema.Thing<D> | undefined;
  categoryLiteral: string | undefined;
}

export function RecommendationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Recommendation & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class RecommendationClass extends ReviewMixin(Resource) {
    @rdfine.property.resource()
    category: Schema.CategoryCode | Schema.Thing | undefined;
    @rdfine.property.literal({ path: schema.category })
    categoryLiteral: string | undefined;
  }
  return RecommendationClass as any
}
RecommendationMixin.appliesTo = schema.Recommendation
RecommendationMixin.createFactory = (env: RdfineEnvironment) => createFactory<Recommendation>([ReviewMixin, RecommendationMixin], { types: [schema.Recommendation] }, env)
