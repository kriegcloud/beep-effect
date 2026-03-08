import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CommunicateActionMixin } from './CommunicateAction.js';

export interface InformAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CommunicateAction<D>, rdfine.RdfResource<D> {
  event: Schema.Event<D> | undefined;
}

export function InformActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<InformAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class InformActionClass extends CommunicateActionMixin(Resource) {
    @rdfine.property.resource()
    event: Schema.Event | undefined;
  }
  return InformActionClass as any
}
InformActionMixin.appliesTo = schema.InformAction
InformActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<InformAction>([CommunicateActionMixin, InformActionMixin], { types: [schema.InformAction] }, env)
