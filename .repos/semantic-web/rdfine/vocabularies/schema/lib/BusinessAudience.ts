import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { AudienceMixin } from './Audience.js';

export interface BusinessAudience<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Audience<D>, rdfine.RdfResource<D> {
  numberOfEmployees: Schema.QuantitativeValue<D> | undefined;
  yearlyRevenue: Schema.QuantitativeValue<D> | undefined;
  yearsInOperation: Schema.QuantitativeValue<D> | undefined;
}

export function BusinessAudienceMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<BusinessAudience & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class BusinessAudienceClass extends AudienceMixin(Resource) {
    @rdfine.property.resource()
    numberOfEmployees: Schema.QuantitativeValue | undefined;
    @rdfine.property.resource()
    yearlyRevenue: Schema.QuantitativeValue | undefined;
    @rdfine.property.resource()
    yearsInOperation: Schema.QuantitativeValue | undefined;
  }
  return BusinessAudienceClass as any
}
BusinessAudienceMixin.appliesTo = schema.BusinessAudience
BusinessAudienceMixin.createFactory = (env: RdfineEnvironment) => createFactory<BusinessAudience>([AudienceMixin, BusinessAudienceMixin], { types: [schema.BusinessAudience] }, env)
