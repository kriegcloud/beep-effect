import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CreativeWorkMixin } from './CreativeWork.js';

export interface Menu<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CreativeWork<D>, rdfine.RdfResource<D> {
  hasMenuItem: Schema.MenuItem<D> | undefined;
  hasMenuSection: Schema.MenuSection<D> | undefined;
}

export function MenuMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Menu & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class MenuClass extends CreativeWorkMixin(Resource) {
    @rdfine.property.resource()
    hasMenuItem: Schema.MenuItem | undefined;
    @rdfine.property.resource()
    hasMenuSection: Schema.MenuSection | undefined;
  }
  return MenuClass as any
}
MenuMixin.appliesTo = schema.Menu
MenuMixin.createFactory = (env: RdfineEnvironment) => createFactory<Menu>([CreativeWorkMixin, MenuMixin], { types: [schema.Menu] }, env)
