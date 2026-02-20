/*
 * Copyright (c) 2025 Palantir Technologies
 *
 * Licensed under the MIT License. See LICENSE file in the project root.
 */

import { FetchBridge, IHttpEndpointOptions, MediaType } from 'conjure-client'
import { getPackageVersion } from 'src/utils/packageInfoUtils.js'
import { HttpRequestContext } from './httpRequestContext.js'

export class BaseApi {
  private readonly fetchBridge: FetchBridge

  constructor(
    readonly context: HttpRequestContext,
    readonly baseApiPath: string,
    private readonly serviceName: string,
  ) {
    this.fetchBridge = new FetchBridge({
      baseUrl: `https://${context.apiUrl.hostname}/${baseApiPath}`,
      token: () => context.token,
      userAgent: {
        productName: 'com.palantir.palantir-mcp-cli',
        productVersion: getPackageVersion(),
      },
    })
  }

  async get<T>(endpointPath: string, endpointName: string): Promise<T> {
    return this.call<T>(endpointPath, endpointName, 'GET')
  }

  async post<T>(endpointPath: string, endpointName: string, data: any): Promise<T> {
    return this.call<T>(endpointPath, endpointName, 'POST', data)
  }

  private async call<T>(
    endpointPath: string,
    endpointName: string,
    method: 'GET' | 'POST',
    data = null,
  ): Promise<T> {
    const httpCallData: IHttpEndpointOptions = {
      serviceName: this.serviceName,
      endpointPath,
      endpointName,
      method,
      requestMediaType: MediaType.APPLICATION_JSON,
      responseMediaType: MediaType.APPLICATION_JSON,
      pathArguments: [],
      queryArguments: {},
      data,
    }

    const response: T = await this.fetchBridge.callEndpoint<T>(httpCallData)

    return response as T
  }
}
