#!/bin/bash
set -e

echo "🚀 Starting TeamFlow EC2 Server Provisioning (Host PostgreSQL + Docker App)..."

# 1. Update OS packages
sudo apt update && sudo apt upgrade -y

# 2. Install Docker, Docker Compose, PostgreSQL, Nginx, Certbot, AWS CLI & Git
sudo apt install -y docker.io docker-compose postgresql postgresql-contrib nginx certbot python3-certbot-nginx git curl unzip awscli || sudo apt install -y docker.io docker-compose-plugin postgresql postgresql-contrib nginx certbot python3-certbot-nginx git curl unzip awscli

# 3. Enable and start Docker service
sudo systemctl enable docker
sudo systemctl start docker

# 4. Add current user to Docker group (avoids needing sudo for docker commands)
sudo usermod -aG docker $USER

# 5. Configure Host PostgreSQL for Docker access
sudo systemctl enable postgresql
sudo systemctl start postgresql

PG_CONF=$(find /etc/postgresql/ -name "postgresql.conf" 2>/dev/null | head -n 1)
PG_HBA=$(find /etc/postgresql/ -name "pg_hba.conf" 2>/dev/null | head -n 1)

if [ -n "$PG_CONF" ] && [ -f "$PG_CONF" ]; then
    echo "⚙️ Configuring PostgreSQL listen_addresses to '*'..."
    sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/g" "$PG_CONF"
    sudo sed -i "s/listen_addresses = 'localhost'/listen_addresses = '*'/g" "$PG_CONF"
fi

if [ -n "$PG_HBA" ] && [ -f "$PG_HBA" ]; then
    if ! grep -q "172.16.0.0/12" "$PG_HBA"; then
        echo "⚙️ Allowing Docker subnet in pg_hba.conf..."
        echo "host    all             all             172.16.0.0/12            md5" | sudo tee -a "$PG_HBA"
        echo "host    all             all             127.0.0.1/32             md5" | sudo tee -a "$PG_HBA"
    fi
fi
sudo systemctl restart postgresql

# 6. Create deployment directory
sudo mkdir -p /opt/teamflow
sudo chown -R $USER:$USER /opt/teamflow

# 7. Copy Nginx Configuration if exists
if [ -f /opt/teamflow/nginx/teamflow.conf ]; then
    sudo mkdir -p /etc/nginx/sites-available /etc/nginx/sites-enabled
    sudo cp /opt/teamflow/nginx/teamflow.conf /etc/nginx/sites-available/teamflow
    sudo ln -sf /etc/nginx/sites-available/teamflow /etc/nginx/sites-enabled/teamflow
    sudo rm -f /etc/nginx/sites-enabled/default
    sudo nginx -t
    sudo systemctl restart nginx
fi

echo "✅ EC2 Server Setup Complete! PostgreSQL is running natively on EC2, and TeamFlow containers are ready."
