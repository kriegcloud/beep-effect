import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { SequentialRelationMixin } from './SequentialRelation.js';

export interface TemporalRelation<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.SequentialRelation<D>, rdfine.RdfResource<D> {
  'temporalRelation_role': Rico.TemporalRelation<D> | undefined;
}

export function TemporalRelationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<TemporalRelation & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class TemporalRelationClass extends SequentialRelationMixin(Resource) {
    @rdfine.property.resource({ as: [TemporalRelationMixin] })
    'temporalRelation_role': Rico.TemporalRelation | undefined;
  }
  return TemporalRelationClass as any
}
TemporalRelationMixin.appliesTo = rico.TemporalRelation
TemporalRelationMixin.createFactory = (env: RdfineEnvironment) => createFactory<TemporalRelation>([SequentialRelationMixin, TemporalRelationMixin], { types: [rico.TemporalRelation] }, env)
