import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { AutomotiveBusinessMixin } from './AutomotiveBusiness.js';

export interface AutoDealer<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.AutomotiveBusiness<D>, rdfine.RdfResource<D> {
}

export function AutoDealerMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<AutoDealer & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class AutoDealerClass extends AutomotiveBusinessMixin(Resource) {
  }
  return AutoDealerClass as any
}
AutoDealerMixin.appliesTo = schema.AutoDealer
AutoDealerMixin.createFactory = (env: RdfineEnvironment) => createFactory<AutoDealer>([AutomotiveBusinessMixin, AutoDealerMixin], { types: [schema.AutoDealer] }, env)
