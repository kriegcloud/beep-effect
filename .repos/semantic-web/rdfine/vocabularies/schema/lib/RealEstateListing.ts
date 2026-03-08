import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { WebPageMixin } from './WebPage.js';

export interface RealEstateListing<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.WebPage<D>, rdfine.RdfResource<D> {
  datePosted: Date | undefined;
  leaseLength: Schema.Duration<D> | Schema.QuantitativeValue<D> | undefined;
}

export function RealEstateListingMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<RealEstateListing & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class RealEstateListingClass extends WebPageMixin(Resource) {
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#date') })
    datePosted: Date | undefined;
    @rdfine.property.resource()
    leaseLength: Schema.Duration | Schema.QuantitativeValue | undefined;
  }
  return RealEstateListingClass as any
}
RealEstateListingMixin.appliesTo = schema.RealEstateListing
RealEstateListingMixin.createFactory = (env: RdfineEnvironment) => createFactory<RealEstateListing>([WebPageMixin, RealEstateListingMixin], { types: [schema.RealEstateListing] }, env)
