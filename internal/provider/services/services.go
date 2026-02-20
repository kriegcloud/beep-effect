// Copyright 2025 Palantir Technologies, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package services

import (
	"os"

	"gopkg.in/yaml.v2"
)

type ResolvedServiceUrls struct {
	ApiGatewayUrl string
	MultipassUrl  string
}

type serviceDiscovery struct {
	Multipass  []string `yaml:"multipass"`
	ApiGateway []string `yaml:"api_gateway"`
}

func ResolveUrls(configHost string) *ResolvedServiceUrls {
	host := configHost
	if host == "" {
		host = os.Getenv("BASE_HOSTNAME")
	}

	if host != "" {
		return &ResolvedServiceUrls{
			ApiGatewayUrl: host + "api",
			MultipassUrl:  host + "multipass/api",
		}
	}

	serviceDiscoveryPath := os.Getenv("FOUNDRY_SERVICE_DISCOVERY_V2")
	if serviceDiscoveryPath != "" {
		yamlFile, err := os.ReadFile(serviceDiscoveryPath)
		if err != nil {
			panic(err)
		}
		var config serviceDiscovery
		err = yaml.Unmarshal(yamlFile, &config)
		if err != nil {
			panic(err)
		}

		return &ResolvedServiceUrls{
			ApiGatewayUrl: config.ApiGateway[0],
			MultipassUrl:  config.Multipass[0],
		}
	}

	return nil
}
