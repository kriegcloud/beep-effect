import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { InteractActionMixin } from './InteractAction.js';

export interface MarryAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.InteractAction<D>, rdfine.RdfResource<D> {
}

export function MarryActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<MarryAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class MarryActionClass extends InteractActionMixin(Resource) {
  }
  return MarryActionClass as any
}
MarryActionMixin.appliesTo = schema.MarryAction
MarryActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<MarryAction>([InteractActionMixin, MarryActionMixin], { types: [schema.MarryAction] }, env)
