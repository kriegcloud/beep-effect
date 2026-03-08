import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { WebPageElementMixin } from './WebPageElement.js';

export interface WPSideBar<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.WebPageElement<D>, rdfine.RdfResource<D> {
}

export function WPSideBarMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<WPSideBar & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class WPSideBarClass extends WebPageElementMixin(Resource) {
  }
  return WPSideBarClass as any
}
WPSideBarMixin.appliesTo = schema.WPSideBar
WPSideBarMixin.createFactory = (env: RdfineEnvironment) => createFactory<WPSideBar>([WebPageElementMixin, WPSideBarMixin], { types: [schema.WPSideBar] }, env)
