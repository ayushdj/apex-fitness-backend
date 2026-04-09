#!/bin/bash
# Deploy latest code to EC2.
# Usage: ./scripts/deploy.sh
# Required env vars: EC2_HOST, EC2_USER, SSH_KEY_PATH
#   EC2_HOST      — public IP or DNS of your EC2 instance
#   EC2_USER      — ec2-user (Amazon Linux) or ubuntu (Ubuntu)
#   SSH_KEY_PATH  — path to your .pem key file
set -e

EC2_HOST=${EC2_HOST:?"EC2_HOST is required"}
EC2_USER=${EC2_USER:-"ec2-user"}
SSH_KEY_PATH=${SSH_KEY_PATH:?"SSH_KEY_PATH is required"}

echo "==> Deploying to $EC2_USER@$EC2_HOST..."

ssh -i "$SSH_KEY_PATH" -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" << 'REMOTE'
  set -e
  cd ~/apex-fitness-backend
  echo "-- Pulling latest code..."
  git pull origin main
  echo "-- Rebuilding and restarting containers..."
  docker compose up -d --build
  echo "-- Running containers:"
  docker compose ps
REMOTE

echo "==> Deploy complete."
