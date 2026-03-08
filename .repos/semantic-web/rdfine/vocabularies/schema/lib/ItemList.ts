import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { IntangibleMixin } from './Intangible.js';

export interface ItemList<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Intangible<D>, rdfine.RdfResource<D> {
  itemListElement: Array<Schema.ListItem<D> | Schema.Thing<D>>;
  itemListElementLiteral: Array<string>;
  itemListOrder: string | undefined;
  itemListOrderTerm: Schema.ItemListOrderType | undefined;
  numberOfItems: number | undefined;
}

export function ItemListMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ItemList & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ItemListClass extends IntangibleMixin(Resource) {
    @rdfine.property.resource({ values: 'array' })
    itemListElement!: Array<Schema.ListItem | Schema.Thing>;
    @rdfine.property.literal({ path: schema.itemListElement, values: 'array' })
    itemListElementLiteral!: Array<string>;
    @rdfine.property.literal()
    itemListOrder: string | undefined;
    @rdfine.property({ path: schema.itemListOrder })
    itemListOrderTerm: Schema.ItemListOrderType | undefined;
    @rdfine.property.literal({ type: Number })
    numberOfItems: number | undefined;
  }
  return ItemListClass as any
}
ItemListMixin.appliesTo = schema.ItemList
ItemListMixin.createFactory = (env: RdfineEnvironment) => createFactory<ItemList>([IntangibleMixin, ItemListMixin], { types: [schema.ItemList] }, env)
