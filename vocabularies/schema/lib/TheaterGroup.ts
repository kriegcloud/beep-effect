import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { PerformingGroupMixin } from './PerformingGroup.js';

export interface TheaterGroup<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.PerformingGroup<D>, rdfine.RdfResource<D> {
}

export function TheaterGroupMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<TheaterGroup & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class TheaterGroupClass extends PerformingGroupMixin(Resource) {
  }
  return TheaterGroupClass as any
}
TheaterGroupMixin.appliesTo = schema.TheaterGroup
TheaterGroupMixin.createFactory = (env: RdfineEnvironment) => createFactory<TheaterGroup>([PerformingGroupMixin, TheaterGroupMixin], { types: [schema.TheaterGroup] }, env)
