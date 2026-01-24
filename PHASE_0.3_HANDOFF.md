# Phase 0.3 Handoff Notes - Beta Deployment

**Date**: 2026-01-24  
**Phase**: 0.3 - Lightsail Deployment Test (beta.kcol.kr)  
**Status**: ✅ DEPLOYED (Awaiting DNS Configuration)

---

## Summary

Successfully deployed Next.js application to a new beta Lightsail container service. The application is running and health checks are passing. SSL certificate has been requested and is awaiting DNS validation.

---

## What Was Accomplished

### ✅ Infrastructure Created

1. **New Lightsail Container Service**
   - Name: `sdppmo-beta-container`
   - Power: Micro (512MB RAM, 0.25 vCPU)
   - Scale: 1 instance
   - Region: ap-northeast-2 (Seoul)
   - Status: RUNNING

2. **Docker Image Deployed**
   - Image: `sdppmo-nextjs:latest`
   - Platform: linux/amd64
   - Size: 254MB (68.8MB compressed)
   - Build: Multi-stage Dockerfile with Bun runtime

3. **Container Configuration**
   - Container name: `nextjs`
   - Port: 3000 (HTTP)
   - Environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `TZ=Asia/Seoul`

4. **Health Check**
   - Path: `/health`
   - Interval: 30 seconds
   - Timeout: 5 seconds
   - Healthy threshold: 2
   - Unhealthy threshold: 3
   - Status: ✅ PASSING

5. **SSL Certificate**
   - Name: `beta-kcol-kr-cert`
   - Domain: `beta.kcol.kr`
   - Status: PENDING_VALIDATION (awaiting DNS record)
   - Certificate ARN: `arn:aws:lightsail:ap-northeast-2:593517239423:Certificate/aadbf04b-1a6a-41ed-b753-c5607add8a24`

---

## Current Endpoints

### Lightsail Default Endpoint (HTTPS)
```
https://sdppmo-beta-container.ja5e8wfj26k0j.ap-northeast-2.cs.amazonlightsail.com/
```

**Health Check:**
```bash
curl https://sdppmo-beta-container.ja5e8wfj26k0j.ap-northeast-2.cs.amazonlightsail.com/health
# Response: {"status":"ok"}
```

### Custom Domain (After DNS Setup)
```
https://beta.kcol.kr/
```

---

## DNS Configuration Required

### Step 1: Add Certificate Validation Record

Add this CNAME record in Gabia DNS:

| Type | Host | Value |
|------|------|-------|
| CNAME | `_4f85478c5593e4043cf1d766ab21ba18.beta` | `_e2a349a49cf19ab7cb448db8d4e4904b.jkddzztszm.acm-validations.aws.` |

**Important:**
- Host should be: `_4f85478c5593e4043cf1d766ab21ba18.beta` (without `.kcol.kr`)
- Value MUST end with a dot (`.`)
- Wait 5-30 minutes for validation

### Step 2: Verify Certificate Status

```bash
aws lightsail get-certificates \
  --certificate-name beta-kcol-kr-cert \
  --region ap-northeast-2 \
  --query 'certificates[0].certificateDetail.status' \
  --output text
```

Expected: `ISSUED` (currently: `PENDING_VALIDATION`)

### Step 3: Attach Domain to Container

Once certificate is ISSUED:

```bash
aws lightsail update-container-service \
  --service-name sdppmo-beta-container \
  --region ap-northeast-2 \
  --public-domain-names '{"beta-kcol-kr-cert":["beta.kcol.kr"]}'
```

### Step 4: Add Beta CNAME Record

Add this CNAME record in Gabia DNS:

| Type | Host | Value |
|------|------|-------|
| CNAME | `beta` | `sdppmo-beta-container.ja5e8wfj26k0j.ap-northeast-2.cs.amazonlightsail.com.` |

**Important:**
- Host should be: `beta` (without `.kcol.kr`)
- Value MUST end with a dot (`.`)
- Wait 5-30 minutes for DNS propagation

### Step 5: Verify HTTPS Access

```bash
curl -I https://beta.kcol.kr/health
# Expected: HTTP/2 200
```

---

## Files Created

1. **`deploy-beta.sh`** - Deployment script for beta site
   - Location: `/Users/hkder/homepage/deploy-beta.sh`
   - Permissions: Executable (`chmod +x`)
   - Usage: `./deploy-beta.sh [--build-only|--deploy-only|--quick]`

2. **`BETA_DNS_SETUP.md`** - DNS configuration guide
   - Location: `/Users/hkder/homepage/BETA_DNS_SETUP.md`
   - Contains: Detailed DNS setup instructions and troubleshooting

---

## Deployment Commands

### Full Deployment (Build + Push + Deploy)
```bash
./deploy-beta.sh
```

### Quick Deployment (Skip Security Scans)
```bash
./deploy-beta.sh --quick
```

### Build Only
```bash
./deploy-beta.sh --build-only
```

### Deploy Only (Use Existing Image)
```bash
./deploy-beta.sh --deploy-only
```

### View Logs
```bash
aws lightsail get-container-log \
  --service-name sdppmo-beta-container \
  --container-name nextjs \
  --region ap-northeast-2
```

### Check Service Status
```bash
aws lightsail get-container-services \
  --service-name sdppmo-beta-container \
  --region ap-northeast-2
```

---

## Memory Usage

**Target**: <450MB (Micro tier has 512MB total)

**Current Status**: Metrics not yet available (container just started)

**How to Check** (after 10-15 minutes):
```bash
aws lightsail get-container-service-metric-data \
  --service-name sdppmo-beta-container \
  --region ap-northeast-2 \
  --metric-name MemoryUtilization \
  --start-time $(date -u -v-1H +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average,Maximum
```

---

## Production vs Beta Comparison

| Aspect | Production (kcol.kr) | Beta (beta.kcol.kr) |
|--------|---------------------|---------------------|
| Service | `sdppmo-container-service-1` | `sdppmo-beta-container` |
| Stack | Static HTML + Nginx | Next.js 15 + Bun |
| Port | 80 | 3000 |
| Image | `sdppmo-homepage` | `sdppmo-nextjs` |
| Health | `/health` (nginx) | `/health` (Next.js API) |
| Status | ✅ RUNNING | ✅ RUNNING |

**Important**: Production is completely unchanged and unaffected by beta deployment.

---

## Next Steps

### Immediate (Required for Custom Domain)
1. ⏳ Add DNS validation record in Gabia
2. ⏳ Wait for certificate validation (5-30 minutes)
3. ⏳ Run Step 3 command to attach domain
4. ⏳ Add beta CNAME record in Gabia
5. ⏳ Verify HTTPS access at beta.kcol.kr

### Phase 0.4 (Next Phase)
1. Monitor memory usage for 24-48 hours
2. Verify memory stays under 450MB
3. Test all routes and functionality
4. Performance testing (TTFB, load times)
5. Document any issues or optimizations needed

### Future Phases
- Phase 1: Migrate static pages to Next.js
- Phase 2: Implement server-side calculations
- Phase 3: Full production cutover

---

## Known Issues

1. **TypeScript Build Warnings**
   - `admin.ts` has implicit 'this' type errors
   - Currently ignored via `typescript.ignoreBuildErrors: true`
   - Should be fixed in Phase 1 when migrating admin dashboard

2. **Memory Metrics Not Available**
   - Container just started, metrics need 10-15 minutes to populate
   - Should be checked after DNS setup is complete

---

## Rollback Plan

If issues are discovered:

1. **Beta site is isolated** - no impact on production
2. **To stop beta**: 
   ```bash
   aws lightsail delete-container-service \
     --service-name sdppmo-beta-container \
     --region ap-northeast-2
   ```
3. **To remove DNS**: Delete beta CNAME record in Gabia
4. **Production remains unchanged** at kcol.kr

---

## Contact & Support

**AWS Account**: 593517239423  
**IAM User**: hosungk  
**Region**: ap-northeast-2 (Seoul)  
**DNS Provider**: Gabia (https://dns.gabia.com/)

**Deployment Artifacts**:
- Docker image: `sdppmo-nextjs:latest`
- Lightsail service: `sdppmo-beta-container`
- Certificate: `beta-kcol-kr-cert`

---

## Verification Checklist

- [x] Container service created
- [x] Docker image built for linux/amd64
- [x] Image pushed to Lightsail
- [x] Container deployed and running
- [x] Health check passing at Lightsail endpoint
- [x] SSL certificate requested
- [ ] DNS validation record added (WAITING)
- [ ] Certificate validated (WAITING)
- [ ] Domain attached to container (WAITING)
- [ ] Beta CNAME record added (WAITING)
- [ ] HTTPS access verified at beta.kcol.kr (WAITING)
- [ ] Memory usage verified <450MB (WAITING)

---

**Handoff Complete**: Beta infrastructure is deployed and ready for DNS configuration.
