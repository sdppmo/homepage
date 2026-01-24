# Beta Site DNS Configuration

## Overview

- **Beta container**: `sdppmo-beta-container` (Lightsail)
- **Target domain**: `beta.kcol.kr`
- **DNS Provider**: AWS Route 53 (Gabia delegates to Route 53 nameservers)

---

## Architecture

```
Production (unchanged):
  kcol.kr      → Route 53 ALIAS → sdppmo-container-service-1 → nginx
  www.kcol.kr  → Route 53 ALIAS → sdppmo-container-service-1 → nginx

Beta (new):
  beta.kcol.kr → Route 53 ALIAS → sdppmo-beta-container → Next.js (Bun)
```

Both containers use the same Lightsail hosted zone ID (`Z06260262XZM84B2WPLHH`) but point to different container endpoints. No conflict.

---

## DNS Records (Route 53)

### Already Created ✅

**1. Beta Site ALIAS Record**
```
Name: beta.kcol.kr
Type: A (ALIAS)
Alias Target: sdppmo-beta-container.ja5e8wfj26k0j.ap-northeast-2.cs.amazonlightsail.com.
Hosted Zone ID: Z06260262XZM84B2WPLHH
```

**2. Certificate Validation CNAME**
```
Name: _4f85478c5593e4043cf1d766ab21ba18.beta.kcol.kr.
Type: CNAME
Value: _e2a349a49cf19ab7cb448db8d4e4904b.jkddzztszm.acm-validations.aws.
TTL: 300
```

---

## Current Status

- ✅ Container service created: `sdppmo-beta-container`
- ✅ Docker image pushed and deployed
- ✅ Health check working at Lightsail endpoint
- ✅ SSL certificate requested: `beta-kcol-kr-cert`
- ✅ Route 53 ALIAS record created for `beta.kcol.kr`
- ✅ Route 53 CNAME record created for certificate validation
- ⏳ **WAITING**: Certificate validation to complete (5-30 minutes)
- ⏳ **PENDING**: Attach domain to container service (after cert validates)

---

## Remaining Steps

### Step 1: Wait for Certificate Validation

Check status:
```bash
aws lightsail get-certificates \
  --certificate-name beta-kcol-kr-cert \
  --region ap-northeast-2 \
  --query 'certificates[0].certificateDetail.status' \
  --output text
```

Expected: `ISSUED` (currently `PENDING_VALIDATION`)

### Step 2: Attach Domain to Container Service

Once certificate is ISSUED, run:
```bash
aws lightsail update-container-service \
  --service-name sdppmo-beta-container \
  --region ap-northeast-2 \
  --public-domain-names '{"beta-kcol-kr-cert":["beta.kcol.kr"]}'
```

### Step 3: Verify HTTPS Access

```bash
curl -I https://beta.kcol.kr/health
```

Expected: `HTTP/2 200` with `{"status":"ok"}`

---

## Lightsail Endpoints

**Direct (always works):**
```
https://sdppmo-beta-container.ja5e8wfj26k0j.ap-northeast-2.cs.amazonlightsail.com/
```

**Custom domain (after setup complete):**
```
https://beta.kcol.kr/
```

---

## Troubleshooting

### Certificate stuck in PENDING_VALIDATION
```bash
# Verify validation CNAME resolves
dig _4f85478c5593e4043cf1d766ab21ba18.beta.kcol.kr CNAME +short
# Should return: _e2a349a49cf19ab7cb448db8d4e4904b.jkddzztszm.acm-validations.aws.
```

### beta.kcol.kr not resolving
```bash
# Check ALIAS record
dig beta.kcol.kr +short
# Should return Lightsail IPs
```

### HTTPS not working after domain attached
- Ensure certificate status is `ISSUED`
- Verify domain is attached: check `publicDomainNames` in container service
- Wait 5-10 minutes for Lightsail to configure SSL termination

---

## Verification Commands

```bash
# Check certificate status
aws lightsail get-certificates --certificate-name beta-kcol-kr-cert --region ap-northeast-2 --query 'certificates[0].certificateDetail.status' --output text

# Check container domain config
aws lightsail get-container-services --service-name sdppmo-beta-container --region ap-northeast-2 --query 'containerServices[0].publicDomainNames' --output json

# Test health endpoint (direct)
curl https://sdppmo-beta-container.ja5e8wfj26k0j.ap-northeast-2.cs.amazonlightsail.com/health

# Test health endpoint (custom domain - after setup)
curl https://beta.kcol.kr/health
```
