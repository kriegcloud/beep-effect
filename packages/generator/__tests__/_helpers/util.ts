import { Debugger } from 'debug'
import sinon from 'sinon'
import { Context } from '../../lib/index.js'

export const fakeLog = (): Context['log'] => ({
  debug: sinon.stub(),
  warn: sinon.stub(),
  error: sinon.stub(),
} as any)
