import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { FinancialProductMixin } from './FinancialProduct.js';

export interface CurrencyConversionService<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.FinancialProduct<D>, rdfine.RdfResource<D> {
}

export function CurrencyConversionServiceMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<CurrencyConversionService & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class CurrencyConversionServiceClass extends FinancialProductMixin(Resource) {
  }
  return CurrencyConversionServiceClass as any
}
CurrencyConversionServiceMixin.appliesTo = schema.CurrencyConversionService
CurrencyConversionServiceMixin.createFactory = (env: RdfineEnvironment) => createFactory<CurrencyConversionService>([FinancialProductMixin, CurrencyConversionServiceMixin], { types: [schema.CurrencyConversionService] }, env)
