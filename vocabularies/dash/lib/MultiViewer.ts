import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { dash } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Dash from '../index.js';
import { ViewerMixin } from './Viewer.js';

export interface MultiViewer<D extends RDF.DatasetCore = RDF.DatasetCore> extends Dash.Viewer<D>, rdfine.RdfResource<D> {
}

export function MultiViewerMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<MultiViewer & RdfResourceCore> & Base {
  @rdfine.namespace(dash)
  class MultiViewerClass extends ViewerMixin(Resource) {
  }
  return MultiViewerClass as any
}
MultiViewerMixin.appliesTo = dash.MultiViewer
MultiViewerMixin.createFactory = (env: RdfineEnvironment) => createFactory<MultiViewer>([ViewerMixin, MultiViewerMixin], { types: [dash.MultiViewer] }, env)
