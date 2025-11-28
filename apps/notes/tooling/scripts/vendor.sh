# Read excluded packages from JSON array and format them for pnpm
excluded_packages=$(cat << 'EOF' | jq -r '.[] | "!\(.)"'
[
  "@premieroctet/next-admin",
  "jiti",
  "prisma-type-generator",
  "react-day-picker"
]
EOF
)

# Run pnpm update with excluded packages
pnpm up -i -L $excluded_packages