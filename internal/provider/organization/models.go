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

package organization

import (
	"github.com/hashicorp/terraform-plugin-framework/types"
)

type organizationResourceModel struct {
	RID                   types.String `tfsdk:"rid"`
	Name                  types.String `tfsdk:"name"`
	MarkingID             types.String `tfsdk:"marking_id"`
	EnrollmentRID         types.String `tfsdk:"enrollment_rid"`
	Description           types.String `tfsdk:"description"`
	HostName              types.String `tfsdk:"host_name"`
	InitialAdministrators types.Set    `tfsdk:"initial_administrators"`
}

// requestBody contains the schema for request body
type responseBody struct {
	RID         string `json:"rid"`
	Name        string `json:"name"`
	Description string `json:"description"`
	MarkingID   string `json:"markingId"`
	Host        string `json:"host"`
}

type organizationRolesRequestBodyEntry struct {
	RoleID      string `json:"roleId" tfsdk:"role_id"`
	PrincipalID string `json:"principalId" tfsdk:"principal_id"`
}

type organizationRolesResponseBody struct {
	Data []organizationRoleEntry `json:"data"`
}

type organizationRoleEntry struct {
	PrincipalID   string `json:"principalId"`
	PrincipalType string `json:"principalType"`
	RoleID        string `json:"roleId"`
}

type organizationRoleAssignmentsResourceModel struct {
	OrganizationRID             types.String `tfsdk:"organization_rid"`
	OrganizationRoleAssignments types.Set    `tfsdk:"organization_role_assignments"`
}
