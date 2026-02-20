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

package marking

import (
	"github.com/hashicorp/terraform-plugin-framework/types"
)

// markingsResourceModel maps the resource schema data.
type markingResourceModel struct {
	ID                     types.String `tfsdk:"id"`
	CategoryID             types.String `tfsdk:"category_id"`
	Name                   types.String `tfsdk:"name"`
	Description            types.String `tfsdk:"description"`
	InitialRoleAssignments types.Set    `tfsdk:"initial_role_assignments"`
}

// requestBody contains the schema for request body
type responseBody struct {
	ID           string `json:"id"`
	Name         string `json:"name"`
	Description  string `json:"description"`
	CategoryID   string `json:"categoryId"`
	Organization string `json:"organization"`
}

type markingMembersResponseBody struct {
	Data []markingMembersEntry `json:"data"`
}

type markingMembersEntry struct {
	PrincipalID   string `json:"principalId"`
	PrincipalType string `json:"principalType"`
}

type markingRolesRequestBodyEntry struct {
	Role        string `json:"role" tfsdk:"role"`
	PrincipalID string `json:"principalId" tfsdk:"principal_id"`
}

type markingRolesResponseBody struct {
	Data []markingRolesEntry `json:"data"`
}

type markingRolesEntry struct {
	PrincipalID   string `json:"principalId"`
	PrincipalType string `json:"principalType"`
	Role          string `json:"role"`
}

type markingMembershipResourceModel struct {
	MarkingId      types.String `tfsdk:"marking_id"`
	MarkingMembers types.Set    `tfsdk:"marking_members"`
}

type markingRoleAssignmentsResourceModel struct {
	MarkingID              types.String `tfsdk:"marking_id"`
	MarkingRoleAssignments types.Set    `tfsdk:"marking_role_assignments"`
}
