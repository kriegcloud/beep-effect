import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { as } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as As from '../index.js';
import { ActivityMixin } from './Activity.js';

export interface Ignore<D extends RDF.DatasetCore = RDF.DatasetCore> extends As.Activity<D>, rdfine.RdfResource<D> {
}

export function IgnoreMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Ignore & RdfResourceCore> & Base {
  @rdfine.namespace(as)
  class IgnoreClass extends ActivityMixin(Resource) {
  }
  return IgnoreClass as any
}
IgnoreMixin.appliesTo = as.Ignore
IgnoreMixin.createFactory = (env: RdfineEnvironment) => createFactory<Ignore>([ActivityMixin, IgnoreMixin], { types: [as.Ignore] }, env)
