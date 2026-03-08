import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CreateActionMixin } from './CreateAction.js';

export interface FilmAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CreateAction<D>, rdfine.RdfResource<D> {
}

export function FilmActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<FilmAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class FilmActionClass extends CreateActionMixin(Resource) {
  }
  return FilmActionClass as any
}
FilmActionMixin.appliesTo = schema.FilmAction
FilmActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<FilmAction>([CreateActionMixin, FilmActionMixin], { types: [schema.FilmAction] }, env)
