import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { IntangibleMixin } from './Intangible.js';

export interface ListItem<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Intangible<D>, rdfine.RdfResource<D> {
  item: Schema.Thing<D> | undefined;
  nextItem: Schema.ListItem<D> | undefined;
  position: number | string | undefined;
  previousItem: Schema.ListItem<D> | undefined;
}

export function ListItemMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ListItem & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ListItemClass extends IntangibleMixin(Resource) {
    @rdfine.property.resource()
    item: Schema.Thing | undefined;
    @rdfine.property.resource()
    nextItem: Schema.ListItem | undefined;
    @rdfine.property.literal()
    position: number | string | undefined;
    @rdfine.property.resource()
    previousItem: Schema.ListItem | undefined;
  }
  return ListItemClass as any
}
ListItemMixin.appliesTo = schema.ListItem
ListItemMixin.createFactory = (env: RdfineEnvironment) => createFactory<ListItem>([IntangibleMixin, ListItemMixin], { types: [schema.ListItem] }, env)
