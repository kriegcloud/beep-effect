import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { sioc } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Sioc from '../index.js';

export interface Space<D extends RDF.DatasetCore = RDF.DatasetCore> extends rdfine.RdfResource<D> {
  'has_usergroup': Sioc.Usergroup<D> | undefined;
  'space_of': RDF.Term | undefined;
}

export function SpaceMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Space & RdfResourceCore> & Base {
  @rdfine.namespace(sioc)
  class SpaceClass extends Resource {
    @rdfine.property.resource({ implicitTypes: [sioc.Usergroup] })
    'has_usergroup': Sioc.Usergroup | undefined;
    @rdfine.property()
    'space_of': RDF.Term | undefined;
  }
  return SpaceClass as any
}
SpaceMixin.appliesTo = sioc.Space
SpaceMixin.createFactory = (env: RdfineEnvironment) => createFactory<Space>([SpaceMixin], { types: [sioc.Space] }, env)
