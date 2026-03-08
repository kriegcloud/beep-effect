import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { TransferActionMixin } from './TransferAction.js';

export interface DownloadAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.TransferAction<D>, rdfine.RdfResource<D> {
}

export function DownloadActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<DownloadAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class DownloadActionClass extends TransferActionMixin(Resource) {
  }
  return DownloadActionClass as any
}
DownloadActionMixin.appliesTo = schema.DownloadAction
DownloadActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<DownloadAction>([TransferActionMixin, DownloadActionMixin], { types: [schema.DownloadAction] }, env)
