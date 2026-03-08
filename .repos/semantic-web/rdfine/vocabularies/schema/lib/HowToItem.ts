import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ListItemMixin } from './ListItem.js';

export interface HowToItem<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.ListItem<D>, rdfine.RdfResource<D> {
  requiredQuantity: Schema.QuantitativeValue<D> | undefined;
  requiredQuantityLiteral: number | string | undefined;
}

export function HowToItemMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<HowToItem & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class HowToItemClass extends ListItemMixin(Resource) {
    @rdfine.property.resource()
    requiredQuantity: Schema.QuantitativeValue | undefined;
    @rdfine.property.literal({ path: schema.requiredQuantity })
    requiredQuantityLiteral: number | string | undefined;
  }
  return HowToItemClass as any
}
HowToItemMixin.appliesTo = schema.HowToItem
HowToItemMixin.createFactory = (env: RdfineEnvironment) => createFactory<HowToItem>([ListItemMixin, HowToItemMixin], { types: [schema.HowToItem] }, env)
