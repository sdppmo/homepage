#!/usr/bin/env python3
"""
Upload Protected Pages to Supabase Storage

Usage:
    python3 scripts/upload-protected-pages.py

Environment variables required:
    SUPABASE_URL - Supabase project URL
    SUPABASE_SERVICE_ROLE_KEY - Service role key (not anon key)

Or create a .env.local file in project root with these values
"""

import os
import sys
import json
import ssl
import urllib.request
import urllib.error
from pathlib import Path

# Fix Windows console encoding
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# Fix SSL certificate verification on macOS
ssl_context = ssl.create_default_context()
try:
    import certifi
    ssl_context.load_verify_locations(certifi.where())
except ImportError:
    # If certifi not available, use unverified context (less secure but works)
    ssl_context = ssl._create_unverified_context()

# Configuration
BUCKET_NAME = 'protected-pages'
PROTECTED_FILES = [
    {
        'local_path': 'pages/k-col web software/auto-find-section.html',
        'storage_path': 'auto-find-section.html'
    },
    {
        'local_path': 'pages/k-col web software/boq-report.html',
        'storage_path': 'boq-report.html'
    }
    # Add more protected files here as needed
]

# Colors for terminal output
GREEN = '\033[92m'
YELLOW = '\033[93m'
RED = '\033[91m'
NC = '\033[0m'  # No Color


def load_env():
    """Load environment variables from .env.local if exists"""
    env_path = Path(__file__).parent.parent / '.env.local'
    if env_path.exists():
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    value = value.strip().strip('"').strip("'")
                    os.environ[key.strip()] = value


def supabase_request(method, endpoint, body=None, content_type=None):
    """Make HTTP request to Supabase Storage API"""
    url = f"{SUPABASE_URL}/storage/v1{endpoint}"
    
    headers = {
        'Authorization': f'Bearer {SUPABASE_SERVICE_ROLE_KEY}',
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
    }
    
    if content_type:
        headers['Content-Type'] = content_type
    
    data = body.encode('utf-8') if isinstance(body, str) else body
    
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req, context=ssl_context) as response:
            body = response.read()
            return {
                'status': response.status,
                'data': json.loads(body.decode('utf-8')) if body else {}
            }
    except urllib.error.HTTPError as e:
        try:
            error_body = json.loads(e.read().decode('utf-8'))
        except:
            error_body = str(e)
        return {'status': e.code, 'data': error_body}
    except Exception as e:
        return {'status': 0, 'data': str(e)}


def ensure_bucket():
    """Create bucket if it doesn't exist"""
    print(f"📦 Checking bucket: {BUCKET_NAME}")
    
    # Try to get bucket info
    result = supabase_request('GET', f'/bucket/{BUCKET_NAME}')
    
    if result['status'] == 200:
        print(f"   ✓ Bucket exists")
        return True
    
    # Create bucket
    print(f"   Creating bucket...")
    create_result = supabase_request(
        'POST',
        '/bucket',
        json.dumps({
            'id': BUCKET_NAME,
            'name': BUCKET_NAME,
            'public': False,
            'file_size_limit': 10485760,  # 10MB
            'allowed_mime_types': ['text/html']
        }),
        'application/json'
    )
    
    if create_result['status'] in [200, 201]:
        print(f"   ✓ Bucket created")
        return True
    
    print(f"   {RED}❌ Failed to create bucket:{NC}", create_result['data'])
    return False


def upload_file(local_path, storage_path):
    """Upload a single file"""
    project_root = Path(__file__).parent.parent
    full_path = project_root / local_path
    
    if not full_path.exists():
        print(f"   {YELLOW}⚠️  File not found: {local_path}{NC}")
        return False
    
    with open(full_path, 'rb') as f:
        file_content = f.read()
    
    file_size = len(file_content)
    print(f"📄 Uploading: {storage_path} ({file_size / 1024:.1f} KB)")
    
    # Delete existing file first (upsert)
    supabase_request('DELETE', f'/object/{BUCKET_NAME}/{storage_path}')
    
    # Upload new file
    result = supabase_request(
        'POST',
        f'/object/{BUCKET_NAME}/{storage_path}',
        file_content,
        'text/html; charset=utf-8'
    )
    
    if result['status'] in [200, 201]:
        print(f"   {GREEN}✓ Uploaded successfully{NC}")
        return True
    
    print(f"   {RED}❌ Upload failed:{NC}", result['data'])
    return False


def main():
    global SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
    
    load_env()
    
    SUPABASE_URL = os.environ.get('SUPABASE_URL') or os.environ.get('NEXT_PUBLIC_SUPABASE_URL', 'https://iwudkwhafyrhgzuntdgm.supabase.co')
    SUPABASE_SERVICE_ROLE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY') or os.environ.get('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    
    if not SUPABASE_SERVICE_ROLE_KEY:
        print(f"{RED}❌ Error: SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable is required{NC}")
        print()
        print("Create .env.local file with:")
        print("  SUPABASE_URL=https://your-project.supabase.co")
        print("  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key")
        print()
        print("Note: Storage upload typically requires SERVICE_ROLE_KEY (not ANON_KEY)")
        sys.exit(1)
    
    print()
    print("🚀 Supabase Protected Pages Uploader")
    print("=" * 45)
    print(f"   URL: {SUPABASE_URL}")
    print()
    
    # Ensure bucket exists
    if not ensure_bucket():
        sys.exit(1)
    
    print()
    
    # Upload each file
    success_count = 0
    fail_count = 0
    
    for file_info in PROTECTED_FILES:
        if upload_file(file_info['local_path'], file_info['storage_path']):
            success_count += 1
        else:
            fail_count += 1
    
    print()
    print("=" * 45)
    print(f"{GREEN}✅ Success: {success_count} files{NC}")
    if fail_count > 0:
        print(f"{RED}❌ Failed: {fail_count} files{NC}")
    print()
    
    sys.exit(1 if fail_count > 0 else 0)


if __name__ == '__main__':
    main()
