import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { prov } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Prov from '../index.js';

export interface KeyEntityPair<D extends RDF.DatasetCore = RDF.DatasetCore> extends rdfine.RdfResource<D> {
  pairEntity: Prov.Entity<D> | undefined;
  pairKey: RDF.Literal | undefined;
}

export function KeyEntityPairMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<KeyEntityPair & RdfResourceCore> & Base {
  @rdfine.namespace(prov)
  class KeyEntityPairClass extends Resource {
    @rdfine.property.resource({ implicitTypes: [prov.Entity] })
    pairEntity: Prov.Entity | undefined;
    @rdfine.property()
    pairKey: RDF.Literal | undefined;
  }
  return KeyEntityPairClass as any
}
KeyEntityPairMixin.appliesTo = prov.KeyEntityPair
KeyEntityPairMixin.createFactory = (env: RdfineEnvironment) => createFactory<KeyEntityPair>([KeyEntityPairMixin], { types: [prov.KeyEntityPair] }, env)
