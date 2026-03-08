import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { dash } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Dash from '../index.js';
import { ViewerMixin } from './Viewer.js';

export interface SingleViewer<D extends RDF.DatasetCore = RDF.DatasetCore> extends Dash.Viewer<D>, rdfine.RdfResource<D> {
}

export function SingleViewerMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<SingleViewer & RdfResourceCore> & Base {
  @rdfine.namespace(dash)
  class SingleViewerClass extends ViewerMixin(Resource) {
  }
  return SingleViewerClass as any
}
SingleViewerMixin.appliesTo = dash.SingleViewer
SingleViewerMixin.createFactory = (env: RdfineEnvironment) => createFactory<SingleViewer>([ViewerMixin, SingleViewerMixin], { types: [dash.SingleViewer] }, env)
