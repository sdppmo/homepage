# TODO - Security & Feature Implementation

## Server-Side Protection for Protected Pages

### Problem
Client-side JavaScript guards can be bypassed by:
- Disabling JavaScript
- Modifying DOM via dev tools
- Navigating directly to URLs

### Pages Requiring Server-Side Protection

1. **K-COL Web Software** (`pages/k-col web software/crossHcolumnCalculator.html`)
   - Currently: Public file in Docker image
   - Required: Login to access

2. **K-COL Product Schedule** (`pages/K-product/2H_steel_product.html`)
   - Currently: Public file in Docker image
   - Required: Login to access

3. **Other K-COL Calculator Pages** (in `pages/k-col web software/`)
   - `Cross-H-Column-Calculation-Data1.html`
   - `Cross-H-Column-Calculation-Data2.html`
   - `Cross-H-Column-Print.html`
   - `auto-find-section.html`
   - `boq-report.html`

### Implementation Steps

- [ ] **1. Move protected page content to Supabase Storage**
  - Upload actual HTML files to `protected-pages` bucket
  - These are NOT publicly accessible

- [ ] **2. Create loader shell pages**
  - Replace public pages with lightweight loaders
  - Loader checks auth and fetches content via Edge Function
  - Shows login modal if not authenticated

- [ ] **3. Update `serve-protected-page` Edge Function**
  - Add new pages to `PROTECTED_PAGES` config
  - Add "login-only" permission type (no specific column/beam permission needed)

- [ ] **4. Update `.dockerignore`**
  - Exclude real protected content from Docker image
  - Only loader shells are public

- [ ] **5. Deploy changes**
  - `./deploy.sh --upload-protected` - Upload HTML to Supabase Storage
  - `./deploy.sh --deploy-functions` - Deploy updated Edge Function
  - `./deploy.sh` - Deploy Docker with loader shells

---

## Email Verification Issue

### Problem
Verification emails are not being sent after signup.

### Debugging Steps
- [ ] Check Supabase Dashboard → Project Settings → Authentication → SMTP Settings
- [ ] Verify Resend API key is correct
- [ ] Check Resend Dashboard (https://resend.com/emails) for failed/sent emails
- [ ] Verify domain DNS records (SPF, DKIM) in Gabia

---

## Completed Items

- [x] Login guard modal for K-COL Web Software / Product Schedule (client-side UX)
- [x] Pending page with email verification countdown
- [x] Admin user list split (pending vs active)
- [x] pg_cron job for cleanup-unverified-users (48 hours)
- [x] Database trigger removed (handle_new_user)
- [x] Profile creation moved to after email verification
