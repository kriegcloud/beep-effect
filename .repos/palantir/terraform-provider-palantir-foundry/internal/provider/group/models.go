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

package group

import (
	"github.com/hashicorp/terraform-plugin-framework/types"
)

type groupResourceModel struct {
	ID                        types.String `tfsdk:"id"`
	Name                      types.String `tfsdk:"name"`
	Description               types.String `tfsdk:"description"`
	Realm                     types.String `tfsdk:"realm"`
	Organizations             types.List   `tfsdk:"organizations"`
	EnrollmentRID             types.String `tfsdk:"enrollment_rid"`
	AuthenticationProviderRID types.String `tfsdk:"authentication_provider_rid"`
}

type groupMembershipResourceModel struct {
	GroupId      types.String `tfsdk:"group_id"`
	GroupMembers types.Set    `tfsdk:"group_members"`
}

// responseBody contains the schema for response body for groups endpoint
type responseBody struct {
	ID            string   `json:"id"`
	Name          string   `json:"name"`
	Description   string   `json:"description"`
	Realm         string   `json:"realm"`
	Organizations []string `json:"organizations"`
}

// groupMembersResponseBody contains the schema for response body for groups endpoint
type groupMembersResponseBody struct {
	Data []groupMembersEntry `json:"data"`
	//TODO: Add pagination fields if needed
}

type groupMembersEntry struct {
	PrincipalID   string `json:"principalId"`
	PrincipalType string `json:"principalType"`
}
