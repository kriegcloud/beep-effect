#!/bin/bash
set -e

# Usage: ./ops/infra-setup.sh [env]
# First-time infrastructure setup using Terraform

ENV=${1:-prod}
PROJECT_ID=$(gcloud config get-value project)
STATE_BUCKET="effect-ontology-terraform-state"

echo "🔧 Setting up infrastructure for $ENV environment..."
echo "   Project: $PROJECT_ID"

# Check if terraform state bucket exists, create if not
echo ""
echo "📦 Checking Terraform state bucket..."
if ! gcloud storage buckets describe "gs://$STATE_BUCKET" &>/dev/null; then
  echo "   Creating state bucket: $STATE_BUCKET"
  gcloud storage buckets create "gs://$STATE_BUCKET" --location=US
else
  echo "   State bucket exists: $STATE_BUCKET"
fi

# Initialize and apply Terraform
echo ""
echo "🏗️  Initializing Terraform..."
cd infra
terraform init

echo ""
echo "📋 Planning infrastructure changes..."
terraform plan -var-file="environments/${ENV}.tfvars"

echo ""
read -p "Apply these changes? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo ""
  echo "🚀 Applying Terraform..."
  terraform apply -var-file="environments/${ENV}.tfvars" -auto-approve

  echo ""
  echo "✅ Infrastructure setup complete!"
  echo ""
  echo "Next steps:"
  echo "   1. Build and push initial image: ./ops/deploy.sh $ENV"
  echo "   2. Test health endpoint"
else
  echo "Cancelled."
fi
