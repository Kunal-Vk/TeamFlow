#!/bin/bash
set -e

echo "🚀 Starting TeamFlow EC2 Server Provisioning..."

# 1. Update OS packages
sudo apt update && sudo apt upgrade -y

# 2. Install Docker, Docker Compose Plugin, Nginx, Certbot, AWS CLI & Git
sudo apt install -y docker.io docker-compose-plugin nginx certbot python3-certbot-nginx git curl unzip awscli

# 3. Enable and start Docker service
sudo systemctl enable docker
sudo systemctl start docker

# 4. Add current user to Docker group (avoids needing sudo for docker commands)
sudo usermod -aG docker $USER

# 5. Create deployment directory
sudo mkdir -p /opt/teamflow
sudo chown -R $USER:$USER /opt/teamflow

# 6. Copy Nginx Configuration if exists
if [ -f /opt/teamflow/nginx/teamflow.conf ]; then
    sudo cp /opt/teamflow/nginx/teamflow.conf /etc/nginx/sites-available/teamflow
    sudo ln -sf /etc/nginx/sites-available/teamflow /etc/nginx/sites-enabled/teamflow
    sudo rm -f /etc/nginx/sites-enabled/default
    sudo nginx -t
    sudo systemctl restart nginx
fi

echo "✅ EC2 Server Setup Complete! You can now deploy TeamFlow using GitHub Actions."
