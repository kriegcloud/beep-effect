import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { GovernmentBuildingMixin } from './GovernmentBuilding.js';

export interface DefenceEstablishment<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.GovernmentBuilding<D>, rdfine.RdfResource<D> {
}

export function DefenceEstablishmentMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<DefenceEstablishment & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class DefenceEstablishmentClass extends GovernmentBuildingMixin(Resource) {
  }
  return DefenceEstablishmentClass as any
}
DefenceEstablishmentMixin.appliesTo = schema.DefenceEstablishment
DefenceEstablishmentMixin.createFactory = (env: RdfineEnvironment) => createFactory<DefenceEstablishment>([GovernmentBuildingMixin, DefenceEstablishmentMixin], { types: [schema.DefenceEstablishment] }, env)
