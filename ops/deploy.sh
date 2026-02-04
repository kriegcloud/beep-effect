#!/bin/bash
set -e

# Usage: ./ops/deploy.sh [env]
# env: dev or prod (default: prod)

ENV=${1:-prod}
PROJECT_ID=$(gcloud config get-value project)
REGION="us-central1"
SERVICE_NAME="effect-ontology-core-${ENV}"
IMAGE_NAME="gcr.io/$PROJECT_ID/effect-ontology-core"
TAG="${ENV}"

echo "🚀 Deploying to $ENV environment..."
echo "   Project: $PROJECT_ID"
echo "   Service: $SERVICE_NAME"
echo "   Image:   $IMAGE_NAME:$TAG"

# Build Container (multi-platform for Cloud Run)
echo ""
echo "🏗️  Building container for linux/amd64..."
docker build --platform linux/amd64 -t $IMAGE_NAME:$TAG -f packages/@core-v2/Dockerfile .

# Configure Docker for GCR
echo ""
echo "🔐 Configuring Docker for GCR..."
gcloud auth configure-docker --quiet

# Push to GCR
echo ""
echo "⬆️  Pushing to GCR..."
docker push $IMAGE_NAME:$TAG

# Update Cloud Run service (Terraform manages the service config)
echo ""
echo "🔄 Updating Cloud Run service..."
gcloud run services update $SERVICE_NAME \
  --image $IMAGE_NAME:$TAG \
  --region $REGION

echo ""
echo "✅ Deployment complete!"
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)')
echo "🌐 Service URL: $SERVICE_URL"
echo ""
echo "Test endpoints:"
echo "   $SERVICE_URL/health/live"
echo "   $SERVICE_URL/health/ready"
echo "   $SERVICE_URL/api/v1/extract (POST)"
