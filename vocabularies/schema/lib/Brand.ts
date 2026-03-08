import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { IntangibleMixin } from './Intangible.js';

export interface Brand<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Intangible<D>, rdfine.RdfResource<D> {
  aggregateRating: Schema.AggregateRating<D> | undefined;
  logo: Schema.ImageObject<D> | undefined;
  review: Schema.Review<D> | undefined;
  slogan: string | undefined;
}

export function BrandMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Brand & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class BrandClass extends IntangibleMixin(Resource) {
    @rdfine.property.resource()
    aggregateRating: Schema.AggregateRating | undefined;
    @rdfine.property.resource()
    logo: Schema.ImageObject | undefined;
    @rdfine.property.resource()
    review: Schema.Review | undefined;
    @rdfine.property.literal()
    slogan: string | undefined;
  }
  return BrandClass as any
}
BrandMixin.appliesTo = schema.Brand
BrandMixin.createFactory = (env: RdfineEnvironment) => createFactory<Brand>([IntangibleMixin, BrandMixin], { types: [schema.Brand] }, env)
