import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { UseActionMixin } from './UseAction.js';

export interface WearAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.UseAction<D>, rdfine.RdfResource<D> {
}

export function WearActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<WearAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class WearActionClass extends UseActionMixin(Resource) {
  }
  return WearActionClass as any
}
WearActionMixin.appliesTo = schema.WearAction
WearActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<WearAction>([UseActionMixin, WearActionMixin], { types: [schema.WearAction] }, env)
