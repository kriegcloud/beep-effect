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

package enrollment

import (
	"github.com/hashicorp/terraform-plugin-framework/types"
)

type enrollmentResourceModel struct {
	RID             types.String `tfsdk:"rid"`
	EnrollmentRoles types.Set    `tfsdk:"enrollment_roles"`
}

type enrollmentRolesRequestBodyEntry struct {
	RoleID      string `json:"roleId" tfsdk:"role_id"`
	PrincipalID string `json:"principalId" tfsdk:"principal_id"`
}

type enrollmentRolesResponseBody struct {
	Data []enrollmentRoleEntry `json:"data"`
}

type enrollmentRoleEntry struct {
	PrincipalID   string `json:"principalId"`
	PrincipalType string `json:"principalType"`
	RoleID        string `json:"roleId"`
}
