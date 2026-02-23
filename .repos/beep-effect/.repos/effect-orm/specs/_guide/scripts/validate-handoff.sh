#!/bin/bash
# validate-handoff.sh - Enforce ≤4K token limit on handoff documents
#
# Usage: ./validate-handoff.sh path/to/handoff.md
#
# Token estimation: ~1.33 tokens per word for markdown content
# Budget: 4000 tokens (enforced across all handoff documents)
#
# Exit codes:
#   0 - Validation passed
#   1 - Validation failed (over budget)
#   2 - Usage error (missing file)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
TOKEN_BUDGET=4000
TOKENS_PER_WORD=1.33

# Parse arguments
FILE="$1"
VERBOSE="${2:-false}"

# Usage check
if [ -z "$FILE" ]; then
    echo "Usage: $0 <handoff-file> [--verbose]"
    echo ""
    echo "Examples:"
    echo "  $0 specs/my-spec/handoffs/HANDOFF_P1.md"
    echo "  $0 specs/my-spec/handoffs/HANDOFF_P1.md --verbose"
    exit 2
fi

# File existence check
if [ ! -f "$FILE" ]; then
    echo -e "${RED}ERROR: File not found: $FILE${NC}"
    exit 2
fi

# Count words and estimate tokens
WORD_COUNT=$(wc -w < "$FILE" | tr -d ' ')
# Using bc for floating point, fallback to integer math
if command -v bc &> /dev/null; then
    TOKEN_ESTIMATE=$(echo "scale=0; $WORD_COUNT * $TOKENS_PER_WORD / 1" | bc)
else
    TOKEN_ESTIMATE=$((WORD_COUNT * 4 / 3))
fi

# Calculate percentage of budget
PERCENTAGE=$((TOKEN_ESTIMATE * 100 / TOKEN_BUDGET))

# Verbose output
if [ "$VERBOSE" = "--verbose" ] || [ "$VERBOSE" = "-v" ]; then
    echo "File: $FILE"
    echo "Word count: $WORD_COUNT"
    echo "Token estimate: $TOKEN_ESTIMATE"
    echo "Budget: $TOKEN_BUDGET"
    echo "Usage: $PERCENTAGE%"
    echo ""
fi

# Validation
if [ "$TOKEN_ESTIMATE" -gt "$TOKEN_BUDGET" ]; then
    OVER=$((TOKEN_ESTIMATE - TOKEN_BUDGET))

    echo -e "${RED}❌ FAILED: Handoff exceeds 4K token budget${NC}"
    echo ""
    echo "   File: $FILE"
    echo "   Estimated tokens: $TOKEN_ESTIMATE"
    echo "   Budget: $TOKEN_BUDGET"
    echo "   Over by: $OVER tokens"
    echo ""
    echo -e "${YELLOW}Suggestions:${NC}"
    echo "   • Move detailed content to outputs/ directory"
    echo "   • Use links instead of inline content"
    echo "   • Split into multiple documents"
    echo "   • Remove redundant context"
    echo "   • Use bullet points instead of prose"
    exit 1
fi

# Warning zone (>80% of budget)
if [ "$PERCENTAGE" -gt 80 ]; then
    echo -e "${YELLOW}⚠️  WARNING: Approaching token budget${NC}"
    echo "   $TOKEN_ESTIMATE tokens ($PERCENTAGE% of $TOKEN_BUDGET budget)"
    echo "   File: $FILE"
    echo ""
    echo -e "${GREEN}✅ PASSED${NC} (with warning)"
    exit 0
fi

echo -e "${GREEN}✅ PASSED: $TOKEN_ESTIMATE tokens ($PERCENTAGE% of budget)${NC}"
