import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CreativeWorkMixin } from './CreativeWork.js';

export interface Quotation<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CreativeWork<D>, rdfine.RdfResource<D> {
  spokenByCharacter: Schema.Organization<D> | Schema.Person<D> | undefined;
}

export function QuotationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Quotation & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class QuotationClass extends CreativeWorkMixin(Resource) {
    @rdfine.property.resource()
    spokenByCharacter: Schema.Organization | Schema.Person | undefined;
  }
  return QuotationClass as any
}
QuotationMixin.appliesTo = schema.Quotation
QuotationMixin.createFactory = (env: RdfineEnvironment) => createFactory<Quotation>([CreativeWorkMixin, QuotationMixin], { types: [schema.Quotation] }, env)
