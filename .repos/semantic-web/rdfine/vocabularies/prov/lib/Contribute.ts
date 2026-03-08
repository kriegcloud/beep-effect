import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { prov } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Prov from '../index.js';
import { ActivityMixin } from './Activity.js';

export interface Contribute<D extends RDF.DatasetCore = RDF.DatasetCore> extends Prov.Activity<D>, rdfine.RdfResource<D> {
}

export function ContributeMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Contribute & RdfResourceCore> & Base {
  @rdfine.namespace(prov)
  class ContributeClass extends ActivityMixin(Resource) {
  }
  return ContributeClass as any
}
ContributeMixin.appliesTo = prov.Contribute
ContributeMixin.createFactory = (env: RdfineEnvironment) => createFactory<Contribute>([ActivityMixin, ContributeMixin], { types: [prov.Contribute] }, env)
