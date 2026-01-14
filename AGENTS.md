# AI Agent Context - SongDoPartners Homepage

> This document provides context for AI agents working on this project.
> Last updated: 2026-01-15

## Project Overview

**Project**: SongDoPartners (SDP) Corporate Homepage
**Purpose**: K-COL Steel Column Design Platform - Corporate website with product information, calculators, and news
**Stack**: Static HTML/CSS/JS served via Nginx in Docker, deployed to AWS Lightsail
**Domain**: https://kcol.kr, https://www.kcol.kr

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        AWS Lightsail                             │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Container Service: sdppmo-container-service-1          │    │
│  │  Region: ap-northeast-2 (Seoul)                         │    │
│  │  ┌─────────────────────────────────────────────────┐    │    │
│  │  │  Docker Container (nginx:alpine)                │    │    │
│  │  │  - Port 80 (HTTP)                               │    │    │
│  │  │  - Health check: /health                        │    │    │
│  │  │  - Static files in /usr/share/nginx/html        │    │    │
│  │  └─────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│  ┌───────────────────────────▼───────────────────────────┐      │
│  │  Lightsail Load Balancer                              │      │
│  │  - HTTPS termination (automatic SSL)                  │      │
│  │  - Custom domains: kcol.kr, www.kcol.kr               │      │
│  │  - Public Endpoint (DNS, not static IP)               │      │
│  └───────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  AWS Lightsail Public HTTPS Endpoint (NOT a static IP)          │
│  https://sdppmo-container-service-1.xxxxx.ap-northeast-2.       │
│         cs.amazonlightsail.com                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  DNS Provider: Gabia (Korean Registrar)                          │
│  Domain: kcol.kr                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  DNS Records:                                           │    │
│  │  kcol.kr      → CNAME → Lightsail endpoint              │    │
│  │  www.kcol.kr  → CNAME → Lightsail endpoint              │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Networking & DNS Configuration

### Key Concept: Lightsail Container DNS Endpoint

**Important**: Lightsail Container Services provide a **DNS endpoint (HTTPS URL)**, NOT a static IP address. This is different from Lightsail Instances which can have static IPs.

**Lightsail Endpoint Format:**
```
https://{service-name}.{random-id}.{region}.cs.amazonlightsail.com
```

**Current Endpoint:**
```
https://sdppmo-container-service-1.ja5e8wfj26k0j.ap-northeast-2.cs.amazonlightsail.com
```

### DNS Setup via Gabia

**Domain Registrar**: Gabia (가비아) - Korean domain registrar
**Domain**: `kcol.kr`

#### Understanding CNAME vs A Records

**Traditional Setup (with static IP):**
```
example.com      → A record     → 192.0.2.1 (IP address)
www.example.com  → CNAME record → example.com (resolves to same IP)
```

**Lightsail Container Setup (NO static IP, only DNS endpoint):**
```
kcol.kr          → ALIAS/ANAME  → sdppmo-container-service-1.xxx.cs.amazonlightsail.com
www.kcol.kr      → CNAME        → sdppmo-container-service-1.xxx.cs.amazonlightsail.com
```

#### Why This Is Different

1. **Lightsail Container Services don't provide static IPs** - only a DNS hostname
2. **You cannot use an A record** because A records require an IP address
3. **CNAME on apex domain (`kcol.kr`) is technically not allowed by DNS spec** - but some providers offer workarounds

#### DNS Records Configuration (in Gabia)

**Option A: If Gabia supports ALIAS/ANAME records**
| Type | Host | Value |
|------|------|-------|
| ALIAS | `@` (root) | `sdppmo-container-service-1.ja5e8wfj26k0j.ap-northeast-2.cs.amazonlightsail.com` |
| CNAME | `www` | `sdppmo-container-service-1.ja5e8wfj26k0j.ap-northeast-2.cs.amazonlightsail.com` |

**Option B: If Gabia only supports standard records**
| Type | Host | Value | Note |
|------|------|-------|------|
| URL Redirect | `@` (root) | `https://www.kcol.kr` | 301 redirect |
| CNAME | `www` | `sdppmo-container-service-1.ja5e8wfj26k0j.ap-northeast-2.cs.amazonlightsail.com` | Main site |

**Option C: CNAME Flattening (if supported)**
Some providers like Cloudflare offer "CNAME flattening" which allows CNAME-like behavior on apex domains.

#### Current Configuration (Verify in Gabia)

Check your Gabia DNS settings at https://dns.gabia.com/ to confirm which option is in use.

### SSL/HTTPS Certificate

**Managed by Lightsail:**
1. Certificates are auto-provisioned when you add custom domains in Lightsail Console
2. Lightsail uses AWS Certificate Manager (ACM) internally
3. Certificates auto-renew - no manual intervention needed

**Setup Steps (already completed):**
1. In Lightsail Console → Container Service → Custom domains
2. Added domains: `kcol.kr`, `www.kcol.kr`
3. Lightsail provided CNAME validation records
4. Added validation records to Gabia DNS
5. Certificate validated and attached automatically

### Traffic Flow

```
User Browser
     │
     ▼
kcol.kr (DNS query to Gabia)
     │
     ▼ CNAME resolution
     │
Lightsail Load Balancer (HTTPS:443)
     │
     ▼ SSL termination
     │
Container Service (HTTP:80)
     │
     ▼
Nginx → Static Files
```

### Important Notes

1. **No Static IP**: You cannot assign a static IP to Container Services. If the endpoint URL changes (rare), DNS records must be updated.

2. **Health Checks**: Lightsail checks `/health` endpoint every 30 seconds. If it fails, traffic is stopped.

3. **HTTP to HTTPS**: Lightsail automatically redirects HTTP to HTTPS for custom domains.

4. **DNS Propagation**: After changing DNS records in Gabia, allow up to 24-48 hours for global propagation (usually much faster).

---

## File Structure

```
homepage/
├── index.html              # Main homepage
├── css/
│   └── styles.css          # All styles including responsive design
├── js/
│   └── main.js             # JavaScript utilities
├── assets/
│   ├── images/             # Product logos, backgrounds, partner logos
│   └── pdf/                # Downloadable brochures
├── pages/
│   ├── k-col web software/ # K-COL calculator pages
│   └── K-product/          # Product pages
│
├── # Docker & Deployment
├── Dockerfile              # Security-hardened nginx:alpine image
├── nginx.conf              # Production nginx config with security headers
├── docker-compose.yml      # Local testing
├── deploy.sh               # Main deployment script
├── .dockerignore           # Excludes sensitive files from Docker
│
├── # Local Development
├── start-server.sh         # Local Python server (Mac/Linux)
├── start-server.bat        # Local Python server (Windows)
├── start-server.ps1        # Local Python server (PowerShell)
│
├── # Documentation
├── README.md               # User documentation
├── AGENTS.md               # This file - AI agent context
│
├── # SENSITIVE (not deployed)
├── admin/                  # Contains accounts.txt with credentials
│   ├── accounts.txt        # ⚠️ Hardcoded test credentials
│   └── *.pdf               # Firebase setup guides
│
└── .gitignore              # Git ignore rules
```

---

## Key Files Explained

### `deploy.sh` - Main Deployment Script

```bash
./deploy.sh                 # Full: build + security + deploy to Lightsail
./deploy.sh --local         # Build + run local server at http://localhost:8080
./deploy.sh --stop          # Stop local server
./deploy.sh --build-only    # Build Docker image only
./deploy.sh --deploy-only   # Deploy existing image to Lightsail
./deploy.sh --quick         # Skip security scans
```

**Configuration (in script):**
- `SERVICE_NAME="sdppmo-container-service-1"`
- `AWS_REGION="ap-northeast-2"`
- `IMAGE_NAME="sdppmo-homepage"`
- `LOCAL_PORT=8080`

### `nginx.conf` - Production Nginx Configuration

**Security features:**
- Rate limiting: 10 req/s per IP, burst 20
- Connection limits: 20 concurrent per IP
- Security headers: X-Frame-Options, CSP, X-Content-Type-Options, etc.
- Blocked patterns: Path traversal, .php, .git, .env, wp-admin, etc.
- Health endpoint: `/health`

### `Dockerfile` - Container Build

- Base: `nginx:1.25-alpine`
- Removes: curl, wget (security)
- Copies: Static files to `/usr/share/nginx/html`
- Health check: Process-based

---

## Known Issues & Technical Debt

### 🔴 Security Issues

1. **Hardcoded Passwords in Frontend**
   - File: `index.html` lines 195-200
   - `TEMP_ACCOUNTS` object contains plain-text passwords
   - Visible in browser source code
   - Current mitigation: Demo/internal use only

2. **Admin Folder in Git**
   - `admin/accounts.txt` contains credentials
   - Should be removed from git history
   - Currently excluded from Docker via `.dockerignore`

### 🟡 Technical Debt

1. **No Semantic Versioning**
   - Uses timestamps, not semver
   - No git tag integration

2. **Client-Side Only Auth**
   - Login is UI demo only
   - No actual authentication backend

3. **No CI/CD Pipeline**
   - Manual deployment via `deploy.sh`
   - Could be automated with GitHub Actions

---

## Common Tasks

### Deploy Changes to Production

```bash
# 1. Test locally first
./deploy.sh --local
# Open http://localhost:8080 and verify changes

# 2. Stop local server
./deploy.sh --stop

# 3. Commit changes
git add .
git commit -m "Description of changes"
git push origin main

# 4. Deploy to Lightsail
./deploy.sh
```

### Fix CSS/Styling Issues

1. Edit `css/styles.css`
2. Responsive breakpoints:
   - `≤1024px` - Tablet
   - `≤768px` - Small tablet/large phone
   - `≤600px` - Mobile
   - `≤400px` - Small phone

3. Key layout classes:
   - `.page-wrapper` - Full viewport container
   - `.top-row` - Left column + main area
   - `.bottom-row` - Product logos + footer (100px height)
   - `.left-column` - Navigation sidebar (360px width)
   - `.main-area` - Background image + content
   - `.right-sidebar` - Exchange rates + news

### Add New Page

1. Create HTML file in `pages/` directory
2. Link from `index.html` navigation
3. Ensure responsive design
4. Test with `./deploy.sh --local`

### Update Nginx Security

1. Edit `nginx.conf`
2. Key sections:
   - `map $http_user_agent $bad_bot` - Bot blocking
   - `map $request_uri $suspicious_request` - Path blocking
   - `location` blocks - Routing and headers
3. Rebuild: `./deploy.sh --local`
4. Test with `curl -I http://localhost:8080/`

---

## Environment & Prerequisites

### Development Machine
- Docker Desktop
- AWS CLI v2 (for deployment)
- Python 3 (for local dev server alternative)

### AWS Configuration
- IAM User: `hosungk`
- Required Policy: `AmazonLightsailFullAccess`
- Region: `ap-northeast-2` (Seoul)

### Lightsail Service
- Name: `sdppmo-container-service-1`
- Power: Micro
- Scale: 1
- Custom Domains: `kcol.kr`, `www.kcol.kr`
- SSL: Auto-managed by Lightsail
- Endpoint: `https://sdppmo-container-service-1.ja5e8wfj26k0j.ap-northeast-2.cs.amazonlightsail.com/`

### DNS Provider
- Registrar: Gabia (가비아)
- Domain: `kcol.kr`
- Management: https://dns.gabia.com/

---

## Deployment Checklist

Before deploying:
- [ ] Test locally with `./deploy.sh --local`
- [ ] Check responsive design on mobile viewport
- [ ] Verify footer doesn't overflow
- [ ] Check all links work
- [ ] Run security header check: `curl -I http://localhost:8080/`

After deploying:
- [ ] Wait 2-5 minutes for deployment
- [ ] Verify at https://kcol.kr
- [ ] Check https://www.kcol.kr redirects correctly
- [ ] Test health endpoint: `curl https://kcol.kr/health`

---

## Quick Reference

| Task | Command |
|------|---------|
| Local test | `./deploy.sh --local` |
| Stop local | `./deploy.sh --stop` |
| Full deploy | `./deploy.sh` |
| Quick deploy | `./deploy.sh --quick` |
| Build only | `./deploy.sh --build-only` |
| Check status | `aws lightsail get-container-services --service-name sdppmo-container-service-1 --region ap-northeast-2` |
| View logs | `aws lightsail get-container-log --service-name sdppmo-container-service-1 --container-name homepage --region ap-northeast-2` |

---

## Contact

- Email: sbd_pmo@naver.com
- Website: https://kcol.kr
- Repository: github.com:sdppmo/homepage.git
