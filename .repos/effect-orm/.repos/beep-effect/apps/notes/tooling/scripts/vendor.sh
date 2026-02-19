# Read excluded packages from JSON array and format them for bun
excluded_packages=$(cat << 'EOF' | jq -r '.[] | "!\(.)"'
[
  "jiti",
  "prisma-type-generator",
  "react-day-picker"
]
EOF
)

# Run bun update with excluded packages
bun run up -i -L $excluded_packages