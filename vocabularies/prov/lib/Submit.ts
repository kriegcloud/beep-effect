import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { prov } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Prov from '../index.js';
import { ActivityMixin } from './Activity.js';

export interface Submit<D extends RDF.DatasetCore = RDF.DatasetCore> extends Prov.Activity<D>, rdfine.RdfResource<D> {
}

export function SubmitMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Submit & RdfResourceCore> & Base {
  @rdfine.namespace(prov)
  class SubmitClass extends ActivityMixin(Resource) {
  }
  return SubmitClass as any
}
SubmitMixin.appliesTo = prov.Submit
SubmitMixin.createFactory = (env: RdfineEnvironment) => createFactory<Submit>([ActivityMixin, SubmitMixin], { types: [prov.Submit] }, env)
