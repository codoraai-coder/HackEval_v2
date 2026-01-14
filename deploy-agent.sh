#!/bin/bash

# Agent-Only Deployment Script for HackEval
# Deploys only the Python agent with API

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

APP_DIR="/var/www/hackeval"
BACKUP_DIR="/var/backups/hackeval"
DEPLOY_DIR="$HOME/deploy"

echo -e "${GREEN}Starting Agent Deployment...${NC}"

# Create directories
sudo mkdir -p $APP_DIR/Hackeval_agent
sudo mkdir -p $APP_DIR/logs
sudo mkdir -p $BACKUP_DIR
sudo chown -R $USER:$USER $APP_DIR

# Backup current deployment if exists
if [ -d "$APP_DIR/Hackeval_agent" ]; then
    echo -e "${YELLOW}Creating backup...${NC}"
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    sudo cp -r $APP_DIR/Hackeval_agent $BACKUP_DIR/agent_$TIMESTAMP
    echo -e "${GREEN}Backup created${NC}"
fi

# Stop existing service
echo -e "${YELLOW}Stopping existing services...${NC}"
pm2 stop hackeval-agent-api 2>/dev/null || true
pm2 delete hackeval-agent-api 2>/dev/null || true

# Copy new files
echo -e "${YELLOW}Copying agent files...${NC}"
cp -r $DEPLOY_DIR/Hackeval_agent/* $APP_DIR/Hackeval_agent/

# Copy ecosystem config
if [ -f "$DEPLOY_DIR/ecosystem-agent.config.js" ]; then
    cp $DEPLOY_DIR/ecosystem-agent.config.js $APP_DIR/
fi

# Check for .env file
if [ ! -f "$APP_DIR/Hackeval_agent/.env" ]; then
    echo -e "${RED}Warning: .env file not found at $APP_DIR/Hackeval_agent/.env${NC}"
    echo -e "${YELLOW}Please create it before starting the service${NC}"
fi

# Install Python dependencies
echo -e "${YELLOW}Installing Python dependencies...${NC}"
cd $APP_DIR/Hackeval_agent
pip3 install -r requirements.txt --user

# Start service with PM2
echo -e "${YELLOW}Starting agent API with PM2...${NC}"
cd $APP_DIR
if [ -f "ecosystem-agent.config.js" ]; then
    pm2 start ecosystem-agent.config.js
else
    pm2 start "python3 api.py" --name hackeval-agent-api --cwd $APP_DIR/Hackeval_agent
fi

pm2 save

# Setup Nginx reverse proxy if not already configured
if [ ! -f "/etc/nginx/conf.d/hackeval-agent.conf" ]; then
    echo -e "${YELLOW}Setting up Nginx reverse proxy...${NC}"
    sudo tee /etc/nginx/conf.d/hackeval-agent.conf > /dev/null <<EOF
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_cache_bypass \$http_upgrade;
    }

    client_max_body_size 50M;
}
EOF
    sudo nginx -t && sudo systemctl reload nginx
fi

echo -e "${GREEN}Agent deployment completed!${NC}"
echo -e "${GREEN}API is running at http://localhost:8000${NC}"
echo -e "${GREEN}Documentation available at http://localhost:8000/docs${NC}"

# Show PM2 status
pm2 status
