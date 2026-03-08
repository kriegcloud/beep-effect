import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { TradeActionMixin } from './TradeAction.js';

export interface SellAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.TradeAction<D>, rdfine.RdfResource<D> {
  buyer: Schema.Organization<D> | Schema.Person<D> | undefined;
  warrantyPromise: Schema.WarrantyPromise<D> | undefined;
}

export function SellActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<SellAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class SellActionClass extends TradeActionMixin(Resource) {
    @rdfine.property.resource()
    buyer: Schema.Organization | Schema.Person | undefined;
    @rdfine.property.resource()
    warrantyPromise: Schema.WarrantyPromise | undefined;
  }
  return SellActionClass as any
}
SellActionMixin.appliesTo = schema.SellAction
SellActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<SellAction>([TradeActionMixin, SellActionMixin], { types: [schema.SellAction] }, env)
