import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { dash } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Dash from '../index.js';
import type * as Rdfs from '@rdfine/rdfs';
import { ResourceMixin as RdfsResourceMixin } from '@rdfine/rdfs/lib/Resource';

export interface Widget<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rdfs.Resource<D>, rdfine.RdfResource<D> {
}

export function WidgetMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Widget & RdfResourceCore> & Base {
  @rdfine.namespace(dash)
  class WidgetClass extends RdfsResourceMixin(Resource) {
  }
  return WidgetClass as any
}
WidgetMixin.appliesTo = dash.Widget
WidgetMixin.createFactory = (env: RdfineEnvironment) => createFactory<Widget>([RdfsResourceMixin, WidgetMixin], { types: [dash.Widget] }, env)
