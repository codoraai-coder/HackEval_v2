# Agent-Only Deployment Guide

This guide covers deploying only the HackEval Python agent with a FastAPI wrapper.

## Quick Start

### 1. Copy Deployment Script to EC2

From your local machine:
```powershell
scp -i HackEval.pem deploy-agent.sh ec2-user@43.204.157.58:~/
scp -i HackEval.pem ecosystem-agent.config.js ec2-user@43.204.157.58:~/
```

### 2. Create Environment File on EC2

SSH to EC2:
```bash
ssh -i HackEval.pem ec2-user@43.204.157.58
```

Create the .env file:
```bash
mkdir -p /var/www/hackeval/Hackeval_agent
nano /var/www/hackeval/Hackeval_agent/.env
```

Add:
```env
OPENAI_API_KEY=your_openai_api_key_here
MODEL_NAME=gpt-4
TEMPERATURE=0.7
PORT=8000
CORS_ORIGINS=*
```

### 3. Copy Agent Files to EC2

From local machine:
```powershell
# Create the deploy directory structure
mkdir deploy
mkdir deploy\Hackeval_agent
xcopy /E /I Hackeval_agent deploy\Hackeval_agent
copy ecosystem-agent.config.js deploy\
copy deploy-agent.sh deploy\

# Create tar file (using WSL or Git Bash)
wsl tar -czf deploy-agent.tar.gz deploy/

# Or just copy the folder directly
scp -i HackEval.pem -r Hackeval_agent ec2-user@43.204.157.58:~/deploy/
```

### 4. Deploy on EC2

In your SSH session:
```bash
cd ~/deploy
chmod +x deploy-agent.sh
./deploy-agent.sh
```

### 5. Verify Deployment

Check if the API is running:
```bash
pm2 status
curl http://localhost:8000/health
```

Access the API documentation:
```
http://43.204.157.58/docs
```

## API Endpoints

- `GET /` - Health check
- `GET /health` - Detailed health check
- `POST /evaluate/text` - Evaluate submission from text
- `POST /evaluate/file` - Evaluate submission from uploaded file
- `POST /extract/text` - Extract text from file

## Test the API

```bash
# Health check
curl http://43.204.157.58/health

# Test text evaluation
curl -X POST http://43.204.157.58/evaluate/text \
  -H "Content-Type: application/json" \
  -d '{
    "submission_text": "Test submission content",
    "max_score": 100
  }'
```

## Automatic Deployment with GitHub Actions

After setting up GitHub secrets:
- `EC2_SSH_PRIVATE_KEY`
- `EC2_HOST`: `43.204.157.58`
- `EC2_USER`: `ec2-user`

Push changes:
```powershell
git add .
git commit -m "Deploy agent API"
git push origin main
```

The workflow will automatically deploy when files in `Hackeval_agent/` change.

## Troubleshooting

Check logs:
```bash
pm2 logs hackeval-agent-api
```

Restart service:
```bash
pm2 restart hackeval-agent-api
```

Check Nginx:
```bash
sudo nginx -t
sudo systemctl status nginx
```
