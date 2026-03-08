import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { InstantiationToInstantiationRelationMixin } from './InstantiationToInstantiationRelation.js';
import { TemporalRelationMixin } from './TemporalRelation.js';

export interface DerivationRelation<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.InstantiationToInstantiationRelation<D>, Rico.TemporalRelation<D>, rdfine.RdfResource<D> {
  'derivationRelation_role': Rico.DerivationRelation<D> | undefined;
}

export function DerivationRelationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<DerivationRelation & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class DerivationRelationClass extends TemporalRelationMixin(InstantiationToInstantiationRelationMixin(Resource)) {
    @rdfine.property.resource({ as: [DerivationRelationMixin] })
    'derivationRelation_role': Rico.DerivationRelation | undefined;
  }
  return DerivationRelationClass as any
}
DerivationRelationMixin.appliesTo = rico.DerivationRelation
DerivationRelationMixin.createFactory = (env: RdfineEnvironment) => createFactory<DerivationRelation>([TemporalRelationMixin, InstantiationToInstantiationRelationMixin, DerivationRelationMixin], { types: [rico.DerivationRelation] }, env)
