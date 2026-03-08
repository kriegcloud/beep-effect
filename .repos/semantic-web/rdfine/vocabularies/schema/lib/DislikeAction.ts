import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ReactActionMixin } from './ReactAction.js';

export interface DislikeAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.ReactAction<D>, rdfine.RdfResource<D> {
}

export function DislikeActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<DislikeAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class DislikeActionClass extends ReactActionMixin(Resource) {
  }
  return DislikeActionClass as any
}
DislikeActionMixin.appliesTo = schema.DislikeAction
DislikeActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<DislikeAction>([ReactActionMixin, DislikeActionMixin], { types: [schema.DislikeAction] }, env)
