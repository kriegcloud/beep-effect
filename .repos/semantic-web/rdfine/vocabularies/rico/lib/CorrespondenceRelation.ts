import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { KnowingRelationMixin } from './KnowingRelation.js';

export interface CorrespondenceRelation<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.KnowingRelation<D>, rdfine.RdfResource<D> {
  'correspondenceRelation_role': Rico.CorrespondenceRelation<D> | undefined;
}

export function CorrespondenceRelationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<CorrespondenceRelation & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class CorrespondenceRelationClass extends KnowingRelationMixin(Resource) {
    @rdfine.property.resource({ as: [CorrespondenceRelationMixin] })
    'correspondenceRelation_role': Rico.CorrespondenceRelation | undefined;
  }
  return CorrespondenceRelationClass as any
}
CorrespondenceRelationMixin.appliesTo = rico.CorrespondenceRelation
CorrespondenceRelationMixin.createFactory = (env: RdfineEnvironment) => createFactory<CorrespondenceRelation>([KnowingRelationMixin, CorrespondenceRelationMixin], { types: [rico.CorrespondenceRelation] }, env)
