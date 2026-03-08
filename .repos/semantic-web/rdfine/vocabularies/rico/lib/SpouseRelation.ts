import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { FamilyRelationMixin } from './FamilyRelation.js';

export interface SpouseRelation<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.FamilyRelation<D>, rdfine.RdfResource<D> {
  'spouseRelation_role': Rico.SpouseRelation<D> | undefined;
}

export function SpouseRelationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<SpouseRelation & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class SpouseRelationClass extends FamilyRelationMixin(Resource) {
    @rdfine.property.resource({ as: [SpouseRelationMixin] })
    'spouseRelation_role': Rico.SpouseRelation | undefined;
  }
  return SpouseRelationClass as any
}
SpouseRelationMixin.appliesTo = rico.SpouseRelation
SpouseRelationMixin.createFactory = (env: RdfineEnvironment) => createFactory<SpouseRelation>([FamilyRelationMixin, SpouseRelationMixin], { types: [rico.SpouseRelation] }, env)
