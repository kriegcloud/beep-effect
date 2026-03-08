import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { StructuredValueMixin } from './StructuredValue.js';

export interface DefinedRegion<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.StructuredValue<D>, rdfine.RdfResource<D> {
  addressCountry: Schema.Country<D> | undefined;
  addressCountryLiteral: string | undefined;
  addressRegion: string | undefined;
  postalCode: string | undefined;
  postalCodePrefix: string | undefined;
  postalCodeRange: Schema.PostalCodeRangeSpecification<D> | undefined;
}

export function DefinedRegionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<DefinedRegion & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class DefinedRegionClass extends StructuredValueMixin(Resource) {
    @rdfine.property.resource()
    addressCountry: Schema.Country | undefined;
    @rdfine.property.literal({ path: schema.addressCountry })
    addressCountryLiteral: string | undefined;
    @rdfine.property.literal()
    addressRegion: string | undefined;
    @rdfine.property.literal()
    postalCode: string | undefined;
    @rdfine.property.literal()
    postalCodePrefix: string | undefined;
    @rdfine.property.resource()
    postalCodeRange: Schema.PostalCodeRangeSpecification | undefined;
  }
  return DefinedRegionClass as any
}
DefinedRegionMixin.appliesTo = schema.DefinedRegion
DefinedRegionMixin.createFactory = (env: RdfineEnvironment) => createFactory<DefinedRegion>([StructuredValueMixin, DefinedRegionMixin], { types: [schema.DefinedRegion] }, env)
