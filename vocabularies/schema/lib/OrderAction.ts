import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { TradeActionMixin } from './TradeAction.js';

export interface OrderAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.TradeAction<D>, rdfine.RdfResource<D> {
  deliveryMethod: Schema.DeliveryMethod | undefined;
}

export function OrderActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<OrderAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class OrderActionClass extends TradeActionMixin(Resource) {
    @rdfine.property()
    deliveryMethod: Schema.DeliveryMethod | undefined;
  }
  return OrderActionClass as any
}
OrderActionMixin.appliesTo = schema.OrderAction
OrderActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<OrderAction>([TradeActionMixin, OrderActionMixin], { types: [schema.OrderAction] }, env)
