#!/usr/bin/env python3
"""
Deploy Supabase Edge Functions

Usage:
    python3 scripts/deploy-edge-functions.py [function_name]
    
    # Deploy all functions
    python3 scripts/deploy-edge-functions.py
    
    # Deploy specific function
    python3 scripts/deploy-edge-functions.py serve-protected-page

Environment variables (in .env.local):
    SUPABASE_PROJECT_REF - Project reference ID (from URL: https://xxx.supabase.co -> xxx)
    SUPABASE_ACCESS_TOKEN - Personal access token from Supabase Dashboard
"""

import os
import sys
import subprocess
from pathlib import Path

# Colors
GREEN = '\033[92m'
YELLOW = '\033[93m'
RED = '\033[91m'
NC = '\033[0m'

# Configuration
PROJECT_ROOT = Path(__file__).parent.parent
FUNCTIONS_DIR = PROJECT_ROOT / 'supabase' / 'functions'


def load_env():
    """Load environment variables from .env.local"""
    env_path = PROJECT_ROOT / '.env.local'
    if env_path.exists():
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    value = value.strip().strip('"').strip("'")
                    os.environ[key.strip()] = value


def get_functions():
    """Get list of Edge Functions"""
    if not FUNCTIONS_DIR.exists():
        return []
    return [d.name for d in FUNCTIONS_DIR.iterdir() 
            if d.is_dir() and (d / 'index.ts').exists()]


def deploy_function(project_ref, function_name):
    """Deploy a single Edge Function"""
    print(f"\n📦 Deploying: {function_name}")
    
    function_path = FUNCTIONS_DIR / function_name
    if not function_path.exists():
        print(f"   {RED}❌ Function not found: {function_name}{NC}")
        return False
    
    # Deploy using Supabase CLI
    # --no-verify-jwt: Disable Supabase's automatic JWT verification
    # Our function handles its own JWT validation
    cmd = [
        'supabase', 'functions', 'deploy', function_name,
        '--project-ref', project_ref,
        '--no-verify-jwt'
    ]
    
    try:
        result = subprocess.run(
            cmd,
            cwd=str(PROJECT_ROOT),
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0:
            print(f"   {GREEN}✓ Deployed successfully{NC}")
            return True
        else:
            print(f"   {RED}❌ Deployment failed{NC}")
            if result.stderr:
                print(f"   Error: {result.stderr}")
            if result.stdout:
                print(f"   Output: {result.stdout}")
            return False
            
    except FileNotFoundError:
        print(f"   {RED}❌ Supabase CLI not found. Install with: brew install supabase/tap/supabase{NC}")
        return False
    except Exception as e:
        print(f"   {RED}❌ Error: {e}{NC}")
        return False


def main():
    load_env()
    
    # Get project reference from environment or URL
    project_ref = os.environ.get('SUPABASE_PROJECT_REF')
    
    # Try to extract from SUPABASE_URL if not set
    if not project_ref:
        supabase_url = os.environ.get('SUPABASE_URL', '')
        if 'supabase.co' in supabase_url:
            # Extract from https://xxx.supabase.co
            project_ref = supabase_url.replace('https://', '').split('.')[0]
    
    if not project_ref:
        print(f"{RED}❌ Error: SUPABASE_PROJECT_REF not set{NC}")
        print()
        print("Add to .env.local:")
        print("  SUPABASE_PROJECT_REF=your-project-ref")
        print()
        print("Find it in your Supabase URL: https://[PROJECT_REF].supabase.co")
        sys.exit(1)
    
    # Check if access token is set (needed for first-time login)
    access_token = os.environ.get('SUPABASE_ACCESS_TOKEN')
    if access_token:
        os.environ['SUPABASE_ACCESS_TOKEN'] = access_token
    
    print()
    print("🚀 Supabase Edge Functions Deployer")
    print("=" * 45)
    print(f"   Project: {project_ref}")
    
    # Get functions to deploy
    all_functions = get_functions()
    
    if not all_functions:
        print(f"\n{YELLOW}⚠️  No Edge Functions found in supabase/functions/{NC}")
        sys.exit(0)
    
    # If specific function specified, deploy only that
    if len(sys.argv) > 1:
        target_function = sys.argv[1]
        if target_function not in all_functions:
            print(f"\n{RED}❌ Function not found: {target_function}{NC}")
            print(f"   Available: {', '.join(all_functions)}")
            sys.exit(1)
        functions_to_deploy = [target_function]
    else:
        functions_to_deploy = all_functions
    
    print(f"   Functions: {', '.join(functions_to_deploy)}")
    
    # Deploy each function
    success_count = 0
    fail_count = 0
    
    for func_name in functions_to_deploy:
        if deploy_function(project_ref, func_name):
            success_count += 1
        else:
            fail_count += 1
    
    print()
    print("=" * 45)
    print(f"{GREEN}✅ Success: {success_count} functions{NC}")
    if fail_count > 0:
        print(f"{RED}❌ Failed: {fail_count} functions{NC}")
    print()
    
    sys.exit(1 if fail_count > 0 else 0)


if __name__ == '__main__':
    main()
