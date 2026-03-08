import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { dash } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Dash from '../index.js';
import { WidgetMixin } from './Widget.js';

export interface Viewer<D extends RDF.DatasetCore = RDF.DatasetCore> extends Dash.Widget<D>, rdfine.RdfResource<D> {
}

export function ViewerMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Viewer & RdfResourceCore> & Base {
  @rdfine.namespace(dash)
  class ViewerClass extends WidgetMixin(Resource) {
  }
  return ViewerClass as any
}
ViewerMixin.appliesTo = dash.Viewer
ViewerMixin.createFactory = (env: RdfineEnvironment) => createFactory<Viewer>([WidgetMixin, ViewerMixin], { types: [dash.Viewer] }, env)
