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

package space

import (
	"github.com/hashicorp/terraform-plugin-framework/types"
)

type spaceResourceModel struct {
	RID                         types.String `tfsdk:"rid"`
	EnrollmentRID               types.String `tfsdk:"enrollment_rid"`
	DisplayName                 types.String `tfsdk:"display_name"`
	Description                 types.String `tfsdk:"description"`
	Path                        types.String `tfsdk:"path"`
	FilesystemID                types.String `tfsdk:"filesystem_id"`
	UsageAccountRID             types.String `tfsdk:"usage_account_rid"`
	Organizations               types.Set    `tfsdk:"organizations"`
	DeletionPolicyOrganizations types.Set    `tfsdk:"deletion_policy_organizations"`
	DefaultRoleSetID            types.String `tfsdk:"default_role_set_id"`
}

// responseBody contains the schema for response body
type responseBody struct {
	RID                         string   `json:"rid"`
	EnrollmentRID               string   `json:"enrollmentRid"`
	DisplayName                 string   `json:"displayName"`
	Description                 string   `json:"description"`
	Path                        string   `json:"path"`
	FilesystemID                string   `json:"fileSystemId"`
	UsageAccountRID             string   `json:"usageAccountRid"`
	Organizations               []string `json:"organizations"`
	DeletionPolicyOrganizations []string `json:"deletionPolicyOrganizations"`
	DefaultRoleSetID            string   `json:"defaultRoleSetId"`
}
