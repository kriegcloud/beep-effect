import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { prov } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Prov from '../index.js';
import { DerivationMixin } from './Derivation.js';

export interface Quotation<D extends RDF.DatasetCore = RDF.DatasetCore> extends Prov.Derivation<D>, rdfine.RdfResource<D> {
}

export function QuotationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Quotation & RdfResourceCore> & Base {
  @rdfine.namespace(prov)
  class QuotationClass extends DerivationMixin(Resource) {
  }
  return QuotationClass as any
}
QuotationMixin.appliesTo = prov.Quotation
QuotationMixin.createFactory = (env: RdfineEnvironment) => createFactory<Quotation>([DerivationMixin, QuotationMixin], { types: [prov.Quotation] }, env)
