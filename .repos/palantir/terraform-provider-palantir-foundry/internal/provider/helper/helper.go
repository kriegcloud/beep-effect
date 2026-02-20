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

package helper

import (
	"fmt"
	"io"
	"net/http"

	"github.com/google/uuid"
	"github.com/hashicorp/terraform-plugin-framework/types"
)

func FindStringSliceDiff(oldSlice, newSlice []string) (added, removed []string) {
	oldMap := make(map[string]bool)
	newMap := make(map[string]bool)

	// Populate maps first
	for _, item := range oldSlice {
		oldMap[item] = true
	}

	for _, item := range newSlice {
		newMap[item] = true
	}

	// Check for added elements - elements in newSlice that aren't in oldSlice
	for _, item := range newSlice {
		if !oldMap[item] {
			added = append(added, item)
		}
	}

	// Check for removed elements - elements in oldSlice that aren't in newSlice
	for _, item := range oldSlice {
		if !newMap[item] {
			removed = append(removed, item)
		}
	}

	return added, removed
}

func ExtractBodyFromResponse(httpResp *http.Response) ([]byte, error) {
	bodyBytes, err := io.ReadAll(httpResp.Body)
	if err != nil {
		return nil, err
	}
	defer func(Body io.ReadCloser) {
		err := Body.Close()
		if err != nil {

		}
	}(httpResp.Body)
	return bodyBytes, nil
}

func HandleEmptyFieldString(field string) types.String {
	if field == "" {
		return types.StringNull()
	}
	return types.StringValue(field)
}

func ConvertStringsToUUIDs(strings []string) ([]uuid.UUID, error) {
	uuids := make([]uuid.UUID, 0, len(strings))
	for _, s := range strings {
		u, err := uuid.Parse(s)
		if err != nil {
			return nil, fmt.Errorf("failed to parse UUID %q: %w", s, err)
		}
		uuids = append(uuids, u)
	}
	return uuids, nil
}
