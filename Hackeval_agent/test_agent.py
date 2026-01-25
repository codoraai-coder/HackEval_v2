"""
Test script for HackEval Agent API
Run this locally to verify the agent works before deployment
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

print("=" * 50)
print("HackEval Agent - Local Test")
print("=" * 50)

# Check environment variables
print("\n1. Checking Environment Variables...")
openai_key = os.getenv("OPENAI_API_KEY")
if openai_key:
    print(f"   ✓ OPENAI_API_KEY found ({openai_key[:10]}...)")
else:
    print("   ✗ OPENAI_API_KEY not found!")
    print("   Please create .env file in Hackeval_agent directory")
    exit(1)

print(f"   ✓ OPENAI_MODEL: {os.getenv('OPENAI_MODEL', 'gpt-4o-mini')}")
print(f"   ✓ OPENAI_SEED: {os.getenv('OPENAI_SEED', '42')}")

# Test imports
print("\n2. Testing Imports...")
try:
    from orchestrator import process_file
    print("   ✓ orchestrator.process_file imported")
except Exception as e:
    print(f"   ✗ Failed to import orchestrator: {e}")
    exit(1)

try:
    from Agents.project_context import ProjectAnalysisContext
    print("   ✓ ProjectAnalysisContext imported")
except Exception as e:
    print(f"   ✗ Failed to import ProjectAnalysisContext: {e}")
    exit(1)

try:
    from utils import load_eval_parameters_from_path, EvaluationParameters
    print("   ✓ utils imported")
except Exception as e:
    print(f"   ✗ Failed to import utils: {e}")
    exit(1)

try:
    import fastapi
    import uvicorn
    print("   ✓ FastAPI and Uvicorn installed")
except ImportError as e:
    print(f"   ✗ FastAPI/Uvicorn not installed: {e}")
    print("   Run: pip install -r requirements.txt")
    exit(1)

print("\n" + "=" * 50)
print("✓ All tests passed! Agent is ready to deploy.")
print("=" * 50)
print("\nTo start the API locally:")
print("  python api.py")
print("\nTo deploy to EC2:")
print("1. Copy files: scp -i HackEval.pem -r Hackeval_agent ec2-user@43.204.157.58:~/deploy/")
print("2. Deploy: ssh and run ./deploy-agent.sh")
