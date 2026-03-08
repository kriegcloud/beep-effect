import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { AutomotiveBusinessMixin } from './AutomotiveBusiness.js';

export interface AutoBodyShop<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.AutomotiveBusiness<D>, rdfine.RdfResource<D> {
}

export function AutoBodyShopMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<AutoBodyShop & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class AutoBodyShopClass extends AutomotiveBusinessMixin(Resource) {
  }
  return AutoBodyShopClass as any
}
AutoBodyShopMixin.appliesTo = schema.AutoBodyShop
AutoBodyShopMixin.createFactory = (env: RdfineEnvironment) => createFactory<AutoBodyShop>([AutomotiveBusinessMixin, AutoBodyShopMixin], { types: [schema.AutoBodyShop] }, env)
