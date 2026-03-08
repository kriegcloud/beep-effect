import Environment from '@zazuko/env/Environment.js'
import ZazukoEnv from '@zazuko/env'
import { RdfineFactory } from '../../environment.js'

export function createEnv() {
  return new Environment([
    RdfineFactory,
  ], { parent: ZazukoEnv })
}

export default createEnv()
