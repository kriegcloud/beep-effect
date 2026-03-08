import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { dash } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Dash from '../index.js';
import { EditorMixin } from './Editor.js';

export interface MultiEditor<D extends RDF.DatasetCore = RDF.DatasetCore> extends Dash.Editor<D>, rdfine.RdfResource<D> {
}

export function MultiEditorMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<MultiEditor & RdfResourceCore> & Base {
  @rdfine.namespace(dash)
  class MultiEditorClass extends EditorMixin(Resource) {
  }
  return MultiEditorClass as any
}
MultiEditorMixin.appliesTo = dash.MultiEditor
MultiEditorMixin.createFactory = (env: RdfineEnvironment) => createFactory<MultiEditor>([EditorMixin, MultiEditorMixin], { types: [dash.MultiEditor] }, env)
