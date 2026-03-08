import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ReactActionMixin } from './ReactAction.js';

export interface WantAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.ReactAction<D>, rdfine.RdfResource<D> {
}

export function WantActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<WantAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class WantActionClass extends ReactActionMixin(Resource) {
  }
  return WantActionClass as any
}
WantActionMixin.appliesTo = schema.WantAction
WantActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<WantAction>([ReactActionMixin, WantActionMixin], { types: [schema.WantAction] }, env)
