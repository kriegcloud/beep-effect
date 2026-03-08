import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ActionMixin } from './Action.js';

export interface SeekToAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Action<D>, rdfine.RdfResource<D> {
  startOffset: Schema.HyperTocEntry<D> | undefined;
  startOffsetLiteral: number | undefined;
}

export function SeekToActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<SeekToAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class SeekToActionClass extends ActionMixin(Resource) {
    @rdfine.property.resource()
    startOffset: Schema.HyperTocEntry | undefined;
    @rdfine.property.literal({ path: schema.startOffset, type: Number })
    startOffsetLiteral: number | undefined;
  }
  return SeekToActionClass as any
}
SeekToActionMixin.appliesTo = schema.SeekToAction
SeekToActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<SeekToAction>([ActionMixin, SeekToActionMixin], { types: [schema.SeekToAction] }, env)
