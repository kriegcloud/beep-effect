import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { PerformingGroupMixin } from './PerformingGroup.js';

export interface DanceGroup<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.PerformingGroup<D>, rdfine.RdfResource<D> {
}

export function DanceGroupMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<DanceGroup & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class DanceGroupClass extends PerformingGroupMixin(Resource) {
  }
  return DanceGroupClass as any
}
DanceGroupMixin.appliesTo = schema.DanceGroup
DanceGroupMixin.createFactory = (env: RdfineEnvironment) => createFactory<DanceGroup>([PerformingGroupMixin, DanceGroupMixin], { types: [schema.DanceGroup] }, env)
