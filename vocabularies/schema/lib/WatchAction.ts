import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ConsumeActionMixin } from './ConsumeAction.js';

export interface WatchAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.ConsumeAction<D>, rdfine.RdfResource<D> {
}

export function WatchActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<WatchAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class WatchActionClass extends ConsumeActionMixin(Resource) {
  }
  return WatchActionClass as any
}
WatchActionMixin.appliesTo = schema.WatchAction
WatchActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<WatchAction>([ConsumeActionMixin, WatchActionMixin], { types: [schema.WatchAction] }, env)
