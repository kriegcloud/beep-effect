import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { sh } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Sh from '../index.js';
import type * as Rdfs from '@rdfine/rdfs';
import { ResourceMixin as RdfsResourceMixin } from '@rdfine/rdfs/lib/Resource';

export interface PropertyGroup<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rdfs.Resource<D>, rdfine.RdfResource<D> {
  order: number | undefined;
}

export function PropertyGroupMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<PropertyGroup & RdfResourceCore> & Base {
  @rdfine.namespace(sh)
  class PropertyGroupClass extends RdfsResourceMixin(Resource) {
    @rdfine.property.literal({ type: Number })
    order: number | undefined;
  }
  return PropertyGroupClass as any
}
PropertyGroupMixin.appliesTo = sh.PropertyGroup
PropertyGroupMixin.createFactory = (env: RdfineEnvironment) => createFactory<PropertyGroup>([RdfsResourceMixin, PropertyGroupMixin], { types: [sh.PropertyGroup] }, env)
