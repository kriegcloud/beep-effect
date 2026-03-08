import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { TradeActionMixin } from './TradeAction.js';

export interface BuyAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.TradeAction<D>, rdfine.RdfResource<D> {
  seller: Schema.Organization<D> | Schema.Person<D> | undefined;
  vendor: Schema.Organization<D> | Schema.Person<D> | undefined;
  warrantyPromise: Schema.WarrantyPromise<D> | undefined;
}

export function BuyActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<BuyAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class BuyActionClass extends TradeActionMixin(Resource) {
    @rdfine.property.resource()
    seller: Schema.Organization | Schema.Person | undefined;
    @rdfine.property.resource()
    vendor: Schema.Organization | Schema.Person | undefined;
    @rdfine.property.resource()
    warrantyPromise: Schema.WarrantyPromise | undefined;
  }
  return BuyActionClass as any
}
BuyActionMixin.appliesTo = schema.BuyAction
BuyActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<BuyAction>([TradeActionMixin, BuyActionMixin], { types: [schema.BuyAction] }, env)
