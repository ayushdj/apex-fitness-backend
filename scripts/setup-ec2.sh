#!/bin/bash
# Run once on a fresh EC2 instance (Amazon Linux 2023 or Ubuntu 22.04)
# Usage: bash setup-ec2.sh
set -e

echo "==> Detecting OS..."
if [ -f /etc/os-release ]; then
  . /etc/os-release
  OS=$ID
else
  echo "Cannot detect OS" && exit 1
fi

echo "==> Installing Docker..."
if [ "$OS" = "amzn" ]; then
  sudo yum update -y
  sudo yum install -y docker git
  sudo systemctl start docker
  sudo systemctl enable docker
  sudo usermod -aG docker ec2-user
elif [ "$OS" = "ubuntu" ]; then
  sudo apt-get update -y
  sudo apt-get install -y ca-certificates curl git
  sudo install -m 0755 -d /etc/apt/keyrings
  sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  sudo chmod a+r /etc/apt/keyrings/docker.asc
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
    https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
    | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
  sudo apt-get update -y
  sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
  sudo systemctl start docker
  sudo systemctl enable docker
  sudo usermod -aG docker ubuntu
fi

echo "==> Installing Docker Compose plugin..."
DOCKER_CONFIG=${DOCKER_CONFIG:-$HOME/.docker}
mkdir -p $DOCKER_CONFIG/cli-plugins
curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 \
  -o $DOCKER_CONFIG/cli-plugins/docker-compose
chmod +x $DOCKER_CONFIG/cli-plugins/docker-compose

echo "==> Cloning repo..."
git clone https://github.com/ayushdj/apex-fitness-backend.git ~/apex-fitness-backend

echo "==> Setting up environment..."
cp ~/apex-fitness-backend/.env.example ~/apex-fitness-backend/.env
echo ""
echo "!! Fill in your secrets in ~/apex-fitness-backend/.env before starting:"
echo "   nano ~/apex-fitness-backend/.env"
echo ""
echo "==> Setup complete. After editing .env, run:"
echo "   cd ~/apex-fitness-backend && docker compose up -d --build"
