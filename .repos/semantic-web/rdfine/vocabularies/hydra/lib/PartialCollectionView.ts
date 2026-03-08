import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { hydra } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Hydra from '../index.js';
import { ResourceMixin } from './Resource.js';

export interface PartialCollectionView<D extends RDF.DatasetCore = RDF.DatasetCore> extends Hydra.Resource<D>, rdfine.RdfResource<D> {
}

export function PartialCollectionViewMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<PartialCollectionView & RdfResourceCore> & Base {
  @rdfine.namespace(hydra)
  class PartialCollectionViewClass extends ResourceMixin(Resource) {
  }
  return PartialCollectionViewClass as any
}
PartialCollectionViewMixin.appliesTo = hydra.PartialCollectionView
PartialCollectionViewMixin.createFactory = (env: RdfineEnvironment) => createFactory<PartialCollectionView>([ResourceMixin, PartialCollectionViewMixin], { types: [hydra.PartialCollectionView] }, env)
