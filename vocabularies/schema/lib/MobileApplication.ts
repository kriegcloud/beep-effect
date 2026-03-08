import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { SoftwareApplicationMixin } from './SoftwareApplication.js';

export interface MobileApplication<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.SoftwareApplication<D>, rdfine.RdfResource<D> {
  carrierRequirements: string | undefined;
}

export function MobileApplicationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<MobileApplication & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class MobileApplicationClass extends SoftwareApplicationMixin(Resource) {
    @rdfine.property.literal()
    carrierRequirements: string | undefined;
  }
  return MobileApplicationClass as any
}
MobileApplicationMixin.appliesTo = schema.MobileApplication
MobileApplicationMixin.createFactory = (env: RdfineEnvironment) => createFactory<MobileApplication>([SoftwareApplicationMixin, MobileApplicationMixin], { types: [schema.MobileApplication] }, env)
