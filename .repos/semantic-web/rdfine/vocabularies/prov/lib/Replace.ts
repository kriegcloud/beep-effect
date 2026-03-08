import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { prov } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Prov from '../index.js';
import { ActivityMixin } from './Activity.js';

export interface Replace<D extends RDF.DatasetCore = RDF.DatasetCore> extends Prov.Activity<D>, rdfine.RdfResource<D> {
}

export function ReplaceMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Replace & RdfResourceCore> & Base {
  @rdfine.namespace(prov)
  class ReplaceClass extends ActivityMixin(Resource) {
  }
  return ReplaceClass as any
}
ReplaceMixin.appliesTo = prov.Replace
ReplaceMixin.createFactory = (env: RdfineEnvironment) => createFactory<Replace>([ActivityMixin, ReplaceMixin], { types: [prov.Replace] }, env)
