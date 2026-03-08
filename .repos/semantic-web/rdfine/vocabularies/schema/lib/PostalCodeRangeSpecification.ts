import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { StructuredValueMixin } from './StructuredValue.js';

export interface PostalCodeRangeSpecification<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.StructuredValue<D>, rdfine.RdfResource<D> {
  postalCodeBegin: string | undefined;
  postalCodeEnd: string | undefined;
}

export function PostalCodeRangeSpecificationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<PostalCodeRangeSpecification & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class PostalCodeRangeSpecificationClass extends StructuredValueMixin(Resource) {
    @rdfine.property.literal()
    postalCodeBegin: string | undefined;
    @rdfine.property.literal()
    postalCodeEnd: string | undefined;
  }
  return PostalCodeRangeSpecificationClass as any
}
PostalCodeRangeSpecificationMixin.appliesTo = schema.PostalCodeRangeSpecification
PostalCodeRangeSpecificationMixin.createFactory = (env: RdfineEnvironment) => createFactory<PostalCodeRangeSpecification>([StructuredValueMixin, PostalCodeRangeSpecificationMixin], { types: [schema.PostalCodeRangeSpecification] }, env)
