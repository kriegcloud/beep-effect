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

package constants

import (
	v2 "github.com/palantir/terraform-provider-palantir-foundry/gateway-client/v2"
)

const (
	PreviewMode                     = true
	PageSize                        = v2.CorePageSize(10000)
	OrganizationAdministratorRoleID = "organization:administrator"
	EnrollmentAdministratorRoleID   = "enrollment:administrator"
	PrincipalWithID                 = "principalWithId"
	Everyone                        = "everyone"
)
