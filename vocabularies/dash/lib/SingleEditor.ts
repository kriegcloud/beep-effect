import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { dash } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Dash from '../index.js';
import { EditorMixin } from './Editor.js';

export interface SingleEditor<D extends RDF.DatasetCore = RDF.DatasetCore> extends Dash.Editor<D>, rdfine.RdfResource<D> {
}

export function SingleEditorMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<SingleEditor & RdfResourceCore> & Base {
  @rdfine.namespace(dash)
  class SingleEditorClass extends EditorMixin(Resource) {
  }
  return SingleEditorClass as any
}
SingleEditorMixin.appliesTo = dash.SingleEditor
SingleEditorMixin.createFactory = (env: RdfineEnvironment) => createFactory<SingleEditor>([EditorMixin, SingleEditorMixin], { types: [dash.SingleEditor] }, env)
