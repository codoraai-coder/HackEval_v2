#!/bin/bash

# EC2 Initial Setup Script for HackEval (Amazon Linux 2023/2)
# Run this script once on a fresh EC2 instance to install all required dependencies

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}Starting EC2 Initial Setup for HackEval (Amazon Linux)...${NC}"

# Update system
echo -e "${YELLOW}Updating system packages...${NC}"
sudo yum update -y

# Install Node.js 18.x
echo -e "${YELLOW}Installing Node.js...${NC}"
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Verify Node.js installation
node --version
npm --version

# Install Python 3 and pip
echo -e "${YELLOW}Installing Python...${NC}"
sudo yum install -y python3 python3-pip

# Verify Python installation
python3 --version
pip3 --version

# Install PM2 globally
echo -e "${YELLOW}Installing PM2...${NC}"
sudo npm install -g pm2

# Setup PM2 to start on boot
pm2 startup systemd -u $USER --hp $HOME
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME

# Install Nginx
echo -e "${YELLOW}Installing Nginx...${NC}"
sudo yum install -y nginx
sudo systemctl enable nginx

# Install Git
echo -e "${YELLOW}Installing Git...${NC}"
sudo yum install -y git

# Install MongoDB (optional - if you want to host MongoDB on the same instance)
read -p "Do you want to install MongoDB on this instance? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Installing MongoDB...${NC}"
    sudo tee /etc/yum.repos.d/mongodb-org-6.0.repo > /dev/null <<EOF
[mongodb-org-6.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/amazon/2/mongodb-org/6.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-6.0.asc
EOF
    sudo yum install -y mongodb-org
    sudo systemctl start mongod
    sudo systemctl enable mongod
    echo -e "${GREEN}MongoDB installed and started${NC}"
fi

# Create application directory
echo -e "${YELLOW}Creating application directories...${NC}"
sudo mkdir -p /var/www/hackeval
sudo chown -R $USER:$USER /var/www/hackeval
mkdir -p /var/www/hackeval/logs

# Create backup directory
sudo mkdir -p /var/backups/hackeval
sudo chown -R $USER:$USER /var/backups/hackeval

# Setup firewall (Amazon Linux uses firewalld or security groups)
echo -e "${YELLOW}Configuring firewall...${NC}"
if command -v firewall-cmd &> /dev/null; then
    sudo systemctl start firewalld
    sudo systemctl enable firewalld
    sudo firewall-cmd --permanent --add-service=http
    sudo firewall-cmd --permanent --add-service=https
    sudo firewall-cmd --permanent --add-port=5000/tcp
    sudo firewall-cmd --reload
    echo -e "${GREEN}Firewall configured${NC}"
else
    echo -e "${YELLOW}Note: Configure Security Group in AWS Console for ports 80, 443, 5000${NC}"
fi

# Install additional useful tools
echo -e "${YELLOW}Installing additional tools...${NC}"
sudo yum install -y htop curl wget unzip

echo -e "${GREEN}EC2 Setup completed!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Set up your GitHub repository secrets:"
echo "   - EC2_SSH_PRIVATE_KEY: Your EC2 private key"
echo "   - EC2_HOST: Your EC2 public IP or domain"
echo "   - EC2_USER: ec2-user (for Amazon Linux)"
echo ""
echo "2. Create environment files in /var/www/hackeval:"
echo "   - NodeBackend/.env"
echo "   - Hackeval_agent/.env"
echo ""
echo "3. Configure your domain in setup-nginx.sh and run it"
echo ""
echo "4. Push your code to trigger the CI/CD pipeline"
echo ""
echo -e "${GREEN}System Information:${NC}"
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo "Python: $(python3 --version)"
echo "PM2: $(pm2 --version)"
echo "Nginx: $(nginx -v 2>&1)"
