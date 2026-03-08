import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { dash } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Dash from '../index.js';
import type * as Rdfs from '@rdfine/rdfs';
import { ResourceMixin as RdfsResourceMixin } from '@rdfine/rdfs/lib/Resource';

export interface PropertyRole<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rdfs.Resource<D>, rdfine.RdfResource<D> {
}

export function PropertyRoleMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<PropertyRole & RdfResourceCore> & Base {
  @rdfine.namespace(dash)
  class PropertyRoleClass extends RdfsResourceMixin(Resource) {
  }
  return PropertyRoleClass as any
}
PropertyRoleMixin.appliesTo = dash.PropertyRole
PropertyRoleMixin.createFactory = (env: RdfineEnvironment) => createFactory<PropertyRole>([RdfsResourceMixin, PropertyRoleMixin], { types: [dash.PropertyRole] }, env)
