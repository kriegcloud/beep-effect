import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CommunicateActionMixin } from './CommunicateAction.js';

export interface ShareAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CommunicateAction<D>, rdfine.RdfResource<D> {
}

export function ShareActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ShareAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ShareActionClass extends CommunicateActionMixin(Resource) {
  }
  return ShareActionClass as any
}
ShareActionMixin.appliesTo = schema.ShareAction
ShareActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<ShareAction>([CommunicateActionMixin, ShareActionMixin], { types: [schema.ShareAction] }, env)
