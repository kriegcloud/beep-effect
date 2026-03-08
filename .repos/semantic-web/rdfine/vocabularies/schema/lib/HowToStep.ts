import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CreativeWorkMixin } from './CreativeWork.js';
import { ItemListMixin } from './ItemList.js';
import { ListItemMixin } from './ListItem.js';

export interface HowToStep<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CreativeWork<D>, Schema.ItemList<D>, Schema.ListItem<D>, rdfine.RdfResource<D> {
}

export function HowToStepMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<HowToStep & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class HowToStepClass extends ListItemMixin(ItemListMixin(CreativeWorkMixin(Resource))) {
  }
  return HowToStepClass as any
}
HowToStepMixin.appliesTo = schema.HowToStep
HowToStepMixin.createFactory = (env: RdfineEnvironment) => createFactory<HowToStep>([ListItemMixin, ItemListMixin, CreativeWorkMixin, HowToStepMixin], { types: [schema.HowToStep] }, env)
