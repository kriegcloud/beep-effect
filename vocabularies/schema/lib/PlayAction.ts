import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ActionMixin } from './Action.js';

export interface PlayAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Action<D>, rdfine.RdfResource<D> {
  audience: Schema.Audience<D> | undefined;
  event: Schema.Event<D> | undefined;
}

export function PlayActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<PlayAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class PlayActionClass extends ActionMixin(Resource) {
    @rdfine.property.resource()
    audience: Schema.Audience | undefined;
    @rdfine.property.resource()
    event: Schema.Event | undefined;
  }
  return PlayActionClass as any
}
PlayActionMixin.appliesTo = schema.PlayAction
PlayActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<PlayAction>([ActionMixin, PlayActionMixin], { types: [schema.PlayAction] }, env)
