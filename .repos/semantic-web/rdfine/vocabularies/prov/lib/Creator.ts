import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { prov } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Prov from '../index.js';
import { ContributorMixin } from './Contributor.js';

export interface Creator<D extends RDF.DatasetCore = RDF.DatasetCore> extends Prov.Contributor<D>, rdfine.RdfResource<D> {
}

export function CreatorMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Creator & RdfResourceCore> & Base {
  @rdfine.namespace(prov)
  class CreatorClass extends ContributorMixin(Resource) {
  }
  return CreatorClass as any
}
CreatorMixin.appliesTo = prov.Creator
CreatorMixin.createFactory = (env: RdfineEnvironment) => createFactory<Creator>([ContributorMixin, CreatorMixin], { types: [prov.Creator] }, env)
