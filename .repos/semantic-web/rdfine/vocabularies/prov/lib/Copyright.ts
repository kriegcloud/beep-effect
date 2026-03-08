import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { prov } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Prov from '../index.js';
import { ActivityMixin } from './Activity.js';

export interface Copyright<D extends RDF.DatasetCore = RDF.DatasetCore> extends Prov.Activity<D>, rdfine.RdfResource<D> {
}

export function CopyrightMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Copyright & RdfResourceCore> & Base {
  @rdfine.namespace(prov)
  class CopyrightClass extends ActivityMixin(Resource) {
  }
  return CopyrightClass as any
}
CopyrightMixin.appliesTo = prov.Copyright
CopyrightMixin.createFactory = (env: RdfineEnvironment) => createFactory<Copyright>([ActivityMixin, CopyrightMixin], { types: [prov.Copyright] }, env)
