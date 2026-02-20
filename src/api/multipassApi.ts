/*
 * Copyright (c) 2025 Palantir Technologies
 *
 * Licensed under the MIT License. See LICENSE file in the project root.
 */

import { BaseApi } from './baseApi.js'
import { HttpRequestContext } from './httpRequestContext.js'

export class MultipassApi extends BaseApi {
  constructor(context: HttpRequestContext) {
    super(context, 'multipass/api', 'multipassService')
  }

  public async getTokenTimeToLiveInSeconds(): Promise<number> {
    return this.get('token/ttl', 'getTokenTimeToLiveInSeconds')
  }
}
