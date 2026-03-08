import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { prov } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Prov from '../index.js';
import { ActivityMixin } from './Activity.js';

export interface Modify<D extends RDF.DatasetCore = RDF.DatasetCore> extends Prov.Activity<D>, rdfine.RdfResource<D> {
}

export function ModifyMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Modify & RdfResourceCore> & Base {
  @rdfine.namespace(prov)
  class ModifyClass extends ActivityMixin(Resource) {
  }
  return ModifyClass as any
}
ModifyMixin.appliesTo = prov.Modify
ModifyMixin.createFactory = (env: RdfineEnvironment) => createFactory<Modify>([ActivityMixin, ModifyMixin], { types: [prov.Modify] }, env)
