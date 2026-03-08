import '../extensions/rdfs/Resource.js';
import { ResourceMixinEx } from '../extensions/rdfs/Resource.js';
import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { owl } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Owl from '../index.js';
import type * as Rdf from '@rdfine/rdf';
import type * as Rdfs from '@rdfine/rdfs';
import { ResourceMixin as RdfsResourceMixin } from '@rdfine/rdfs/lib/Resource';
import { ListMixin as RdfListMixin } from '@rdfine/rdf/lib/List';

export interface AllDifferent<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rdfs.Resource<D>, rdfine.RdfResource<D> {
  distinctMembers: Rdf.List<D> | undefined;
}

export function AllDifferentMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<AllDifferent & RdfResourceCore> & Base {
  @rdfine.namespace(owl)
  class AllDifferentClass extends ResourceMixinEx(RdfsResourceMixin(Resource)) {
    @rdfine.property.resource({ as: [RdfListMixin] })
    distinctMembers: Rdf.List | undefined;
  }
  return AllDifferentClass as any
}
AllDifferentMixin.appliesTo = owl.AllDifferent
AllDifferentMixin.createFactory = (env: RdfineEnvironment) => createFactory<AllDifferent>([RdfsResourceMixin, AllDifferentMixin], { types: [owl.AllDifferent] }, env)
