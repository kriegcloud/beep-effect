import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { dash } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Dash from '../index.js';
import { WidgetMixin } from './Widget.js';

export interface Editor<D extends RDF.DatasetCore = RDF.DatasetCore> extends Dash.Widget<D>, rdfine.RdfResource<D> {
}

export function EditorMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Editor & RdfResourceCore> & Base {
  @rdfine.namespace(dash)
  class EditorClass extends WidgetMixin(Resource) {
  }
  return EditorClass as any
}
EditorMixin.appliesTo = dash.Editor
EditorMixin.createFactory = (env: RdfineEnvironment) => createFactory<Editor>([WidgetMixin, EditorMixin], { types: [dash.Editor] }, env)
