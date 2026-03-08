import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { MediaObjectMixin } from './MediaObject.js';

export interface _3DModel<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.MediaObject<D>, rdfine.RdfResource<D> {
  isResizable: boolean | undefined;
}

export function _3DModelMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<_3DModel & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class _3DModelClass extends MediaObjectMixin(Resource) {
    @rdfine.property.literal({ type: Boolean })
    isResizable: boolean | undefined;
  }
  return _3DModelClass as any
}
_3DModelMixin.appliesTo = schema['3DModel']
_3DModelMixin.createFactory = (env: RdfineEnvironment) => createFactory<_3DModel>([MediaObjectMixin, _3DModelMixin], { types: [schema['3DModel']] }, env)
