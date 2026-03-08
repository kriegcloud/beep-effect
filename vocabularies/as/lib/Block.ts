import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { as } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as As from '../index.js';
import { IgnoreMixin } from './Ignore.js';

export interface Block<D extends RDF.DatasetCore = RDF.DatasetCore> extends As.Ignore<D>, rdfine.RdfResource<D> {
}

export function BlockMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Block & RdfResourceCore> & Base {
  @rdfine.namespace(as)
  class BlockClass extends IgnoreMixin(Resource) {
  }
  return BlockClass as any
}
BlockMixin.appliesTo = as.Block
BlockMixin.createFactory = (env: RdfineEnvironment) => createFactory<Block>([IgnoreMixin, BlockMixin], { types: [as.Block] }, env)
