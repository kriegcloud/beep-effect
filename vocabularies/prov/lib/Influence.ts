import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { prov } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Prov from '../index.js';

export interface Influence<D extends RDF.DatasetCore = RDF.DatasetCore> extends rdfine.RdfResource<D> {
  hadActivity: Prov.Activity<D> | undefined;
  hadRole: Prov.Role<D> | undefined;
  influencer: RDF.NamedNode | undefined;
}

export function InfluenceMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Influence & RdfResourceCore> & Base {
  @rdfine.namespace(prov)
  class InfluenceClass extends Resource {
    @rdfine.property.resource({ implicitTypes: [prov.Activity] })
    hadActivity: Prov.Activity | undefined;
    @rdfine.property.resource({ implicitTypes: [prov.Role] })
    hadRole: Prov.Role | undefined;
    @rdfine.property()
    influencer: RDF.NamedNode | undefined;
  }
  return InfluenceClass as any
}
InfluenceMixin.appliesTo = prov.Influence
InfluenceMixin.createFactory = (env: RdfineEnvironment) => createFactory<Influence>([InfluenceMixin], { types: [prov.Influence] }, env)
