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

export interface HowToSection<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CreativeWork<D>, Schema.ItemList<D>, Schema.ListItem<D>, rdfine.RdfResource<D> {
  steps: Array<Schema.CreativeWork<D> | Schema.ItemList<D>>;
  stepsLiteral: Array<string>;
}

export function HowToSectionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<HowToSection & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class HowToSectionClass extends ListItemMixin(ItemListMixin(CreativeWorkMixin(Resource))) {
    @rdfine.property.resource({ values: 'array' })
    steps!: Array<Schema.CreativeWork | Schema.ItemList>;
    @rdfine.property.literal({ path: schema.steps, values: 'array' })
    stepsLiteral!: Array<string>;
  }
  return HowToSectionClass as any
}
HowToSectionMixin.appliesTo = schema.HowToSection
HowToSectionMixin.createFactory = (env: RdfineEnvironment) => createFactory<HowToSection>([ListItemMixin, ItemListMixin, CreativeWorkMixin, HowToSectionMixin], { types: [schema.HowToSection] }, env)
