import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { PriceSpecificationMixin } from './PriceSpecification.js';

export interface CompoundPriceSpecification<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.PriceSpecification<D>, rdfine.RdfResource<D> {
  priceComponent: Schema.UnitPriceSpecification<D> | undefined;
  priceType: string | undefined;
  priceTypeTerm: Schema.PriceTypeEnumeration | undefined;
}

export function CompoundPriceSpecificationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<CompoundPriceSpecification & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class CompoundPriceSpecificationClass extends PriceSpecificationMixin(Resource) {
    @rdfine.property.resource()
    priceComponent: Schema.UnitPriceSpecification | undefined;
    @rdfine.property.literal()
    priceType: string | undefined;
    @rdfine.property({ path: schema.priceType })
    priceTypeTerm: Schema.PriceTypeEnumeration | undefined;
  }
  return CompoundPriceSpecificationClass as any
}
CompoundPriceSpecificationMixin.appliesTo = schema.CompoundPriceSpecification
CompoundPriceSpecificationMixin.createFactory = (env: RdfineEnvironment) => createFactory<CompoundPriceSpecification>([PriceSpecificationMixin, CompoundPriceSpecificationMixin], { types: [schema.CompoundPriceSpecification] }, env)
