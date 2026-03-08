import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { prov } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Prov from '../index.js';
import { EntityInfluenceMixin } from './EntityInfluence.js';

export interface Derivation<D extends RDF.DatasetCore = RDF.DatasetCore> extends Prov.EntityInfluence<D>, rdfine.RdfResource<D> {
  hadActivity: Prov.Activity<D> | undefined;
  hadGeneration: Prov.Generation<D> | undefined;
  hadUsage: Prov.Usage<D> | undefined;
}

export function DerivationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Derivation & RdfResourceCore> & Base {
  @rdfine.namespace(prov)
  class DerivationClass extends EntityInfluenceMixin(Resource) {
    @rdfine.property.resource({ implicitTypes: [prov.Activity] })
    hadActivity: Prov.Activity | undefined;
    @rdfine.property.resource({ implicitTypes: [prov.Generation] })
    hadGeneration: Prov.Generation | undefined;
    @rdfine.property.resource({ implicitTypes: [prov.Usage] })
    hadUsage: Prov.Usage | undefined;
  }
  return DerivationClass as any
}
DerivationMixin.appliesTo = prov.Derivation
DerivationMixin.createFactory = (env: RdfineEnvironment) => createFactory<Derivation>([EntityInfluenceMixin, DerivationMixin], { types: [prov.Derivation] }, env)
