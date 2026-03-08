import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { HowToItemMixin } from './HowToItem.js';

export interface HowToSupply<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.HowToItem<D>, rdfine.RdfResource<D> {
  estimatedCost: Schema.MonetaryAmount<D> | undefined;
  estimatedCostLiteral: string | undefined;
}

export function HowToSupplyMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<HowToSupply & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class HowToSupplyClass extends HowToItemMixin(Resource) {
    @rdfine.property.resource()
    estimatedCost: Schema.MonetaryAmount | undefined;
    @rdfine.property.literal({ path: schema.estimatedCost })
    estimatedCostLiteral: string | undefined;
  }
  return HowToSupplyClass as any
}
HowToSupplyMixin.appliesTo = schema.HowToSupply
HowToSupplyMixin.createFactory = (env: RdfineEnvironment) => createFactory<HowToSupply>([HowToItemMixin, HowToSupplyMixin], { types: [schema.HowToSupply] }, env)
