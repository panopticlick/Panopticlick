# Cloudflare Deployment Guide

Complete guide for deploying Panopticlick to Cloudflare Pages (frontend) and Cloudflare Workers (API) with automated GitHub Actions.

## 🎯 Overview

This project deploys two components:
1. **Next.js App** → Cloudflare Pages (`panopticlick.org`)
2. **API Worker** → Cloudflare Workers (`api.panopticlick.org`)

## 📋 Prerequisites

- Cloudflare account
- GitHub account (repository must be public or have Actions enabled)
- OpenRouter API key (for AI chat feature)
- Git installed locally

## 🔐 Security First

**CRITICAL**: This repository is PUBLIC. Never commit:
- API keys
- Tokens
- Secrets
- `.env` files
- `.dev.vars` files

All sensitive data is stored in:
- **GitHub Secrets** (for CI/CD)
- **Cloudflare Worker Secrets** (for runtime)
- **Local `.dev.vars`** (for development, gitignored)

---

## 🚀 Quick Start Deployment

### Step 1: Get Your Credentials

You need:
- [ ] Cloudflare Account ID (find in Cloudflare Dashboard)
- [ ] Cloudflare API Token (create one with Pages and Workers permissions)
- [ ] OpenRouter API Key (get free at https://openrouter.ai/keys)

### Step 2: Configure GitHub Secrets

Go to your GitHub repository: `Settings` → `Secrets and variables` → `Actions` → `New repository secret`

Add these secrets (click "New repository secret" for each):

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `CLOUDFLARE_API_TOKEN` | Your Cloudflare API Token | Cloudflare API authentication |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare Account ID | Your Cloudflare account ID |
| `OPENROUTER_API_KEY` | `sk-or-v1-your-key-here` | OpenRouter API key for AI chat |

**Screenshots Guide**:
```
1. Go to: https://github.com/YOUR_USERNAME/panopticlick.org/settings/secrets/actions
2. Click "New repository secret"
3. Name: CLOUDFLARE_API_TOKEN
4. Secret: [paste your token]
5. Click "Add secret"
6. Repeat for other secrets
```

### Step 3: Create Cloudflare Pages Project

**Option A: Via Cloudflare Dashboard**

1. Go to: https://dash.cloudflare.com/
2. Click "Workers & Pages"
3. Click "Create application" → "Pages" → "Connect to Git"
4. Select your GitHub repository
5. Configure build settings:
   - **Build command**: `pnpm build`
   - **Build output directory**: `apps/web/out`
   - **Root directory**: `/`
   - **Framework preset**: `Next.js (Static)`
6. Click "Save and Deploy"

**Option B: Via Wrangler CLI** (Automated in GitHub Actions)

The GitHub Actions workflow will handle this automatically on first push.

### Step 4: Create Cloudflare Worker

The GitHub Actions workflow creates this automatically. But to verify:

```bash
cd workers/api
npx wrangler deploy
```

### Step 5: Set OpenRouter Secret in Cloudflare Worker

**IMPORTANT**: This step is required for AI chat to work.

#### Method 1: Via Wrangler CLI (Recommended)

```bash
cd workers/api
echo "your-openrouter-api-key" | npx wrangler secret put OPENROUTER_API_KEY
```

#### Method 2: Via Cloudflare Dashboard

1. Go to: https://dash.cloudflare.com/
2. Workers & Pages → `panopticlick-api`
3. Settings → Variables and Secrets
4. Click "Add variable" → Switch to "Secret"
5. Name: `OPENROUTER_API_KEY`
6. Value: `sk-or-v1-your-key-here`
7. Click "Save"

### Step 6: Configure Custom Domains

#### For Cloudflare Pages (Frontend)

1. Cloudflare Dashboard → Workers & Pages → `panopticlick`
2. Custom domains → Add domain
3. Enter: `panopticlick.org` and `www.panopticlick.org`
4. Follow DNS setup instructions

#### For Cloudflare Workers (API)

1. Edit `workers/api/wrangler.toml`:
```toml
[env.production]
routes = [
  { pattern = "api.panopticlick.org/*", custom_domain = true }
]
```

2. Deploy:
```bash
cd workers/api
npx wrangler deploy --env production
```

3. Add DNS record:
   - Type: `CNAME`
   - Name: `api`
   - Target: `panopticlick-api.YOUR_SUBDOMAIN.workers.dev`
   - Proxy: `Proxied`

### Step 7: Push to GitHub (Auto-Deploy)

```bash
git add .
git commit -m "🚀 Deploy to Cloudflare"
git push origin main
```

GitHub Actions will automatically:
1. ✅ Build Next.js app
2. ✅ Deploy to Cloudflare Pages
3. ✅ Deploy API Worker
4. ✅ Run tests (if configured)

Monitor progress at:
`https://github.com/YOUR_USERNAME/panopticlick.org/actions`

---

## 🔄 Automated Deployments

### Main Branch (Production)

Every push to `main` triggers:
- Full build and deployment
- Both Pages and Workers updated
- Secrets synchronized

### Pull Requests (Preview)

Every PR creates:
- Preview deployment on Cloudflare Pages
- Comment on PR with preview URL
- Isolated environment for testing

### Manual Deployment

Trigger manually via GitHub:
1. Go to: Actions → Deploy to Cloudflare
2. Click "Run workflow"
3. Select branch
4. Click "Run workflow"

---

## 🛠️ Local Development Setup

### 1. Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/panopticlick.org.git
cd panopticlick.org
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Local Environment

#### For Cloudflare Worker (API):

```bash
cd workers/api
cp .dev.vars.example .dev.vars
```

Edit `.dev.vars`:
```bash
OPENROUTER_API_KEY=sk-or-v1-your-key-here
OPENROUTER_MODEL=google/gemini-2.0-flash-exp:free
```

#### For Next.js App:

```bash
cd apps/web
```

Create `.env.local` (optional):
```bash
NEXT_PUBLIC_API_URL=http://localhost:8787
```

### 4. Run Development Servers

**Terminal 1 - API Worker:**
```bash
cd workers/api
pnpm dev
# Runs on http://localhost:8787
```

**Terminal 2 - Next.js App:**
```bash
cd apps/web
pnpm dev
# Runs on http://localhost:3000
```

### 5. Test Locally

- Frontend: http://localhost:3000
- API: http://localhost:8787
- API Health: http://localhost:8787/health

---

## 🧪 Testing Deployment

### Test API Endpoints

```bash
# Health check
curl https://api.panopticlick.org/health

# AI Chat (requires OpenRouter key set)
curl -X POST https://api.panopticlick.org/v1/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"prompt": "What is browser fingerprinting?"}'
```

### Test Frontend

Visit: https://panopticlick.org

Check:
- ✅ Homepage loads
- ✅ AI chat button appears (bottom-right)
- ✅ Chat opens after 15 seconds
- ✅ Quick start questions work
- ✅ Can send custom messages

---

## 📊 Monitoring & Logs

### Cloudflare Workers Logs (Live Tail)

```bash
cd workers/api
npx wrangler tail
```

### GitHub Actions Logs

1. Go to: https://github.com/YOUR_USERNAME/panopticlick.org/actions
2. Click on latest workflow run
3. View logs for each job

### Cloudflare Analytics

1. Cloudflare Dashboard → Analytics & Logs
2. Workers Analytics → `panopticlick-api`
3. Pages Analytics → `panopticlick`

---

## 🔧 Troubleshooting

### Deployment Fails

**Check GitHub Actions logs:**
```
Repository → Actions → Failed workflow → View logs
```

**Common issues:**
- Missing GitHub Secrets → Add them in Settings → Secrets
- Invalid Cloudflare token → Verify token has correct permissions
- Build errors → Check build logs in workflow

### API Not Working

**Test API health:**
```bash
curl https://api.panopticlick.org/health
```

**Check Worker logs:**
```bash
cd workers/api
npx wrangler tail
```

**Verify secrets:**
```bash
cd workers/api
npx wrangler secret list
```

Should show:
- `OPENROUTER_API_KEY`

### AI Chat Not Responding

1. **Check OpenRouter key is set:**
   ```bash
   cd workers/api
   npx wrangler secret list
   ```

2. **Test OpenRouter key directly:**
   ```bash
   curl https://openrouter.ai/api/v1/models \
     -H "Authorization: Bearer YOUR_KEY"
   ```

3. **Check rate limits:**
   - Visit: https://openrouter.ai/activity
   - Check usage and limits

4. **View Worker logs:**
   ```bash
   npx wrangler tail
   ```

### Custom Domain Issues

**For Pages:**
1. Verify DNS records in Cloudflare DNS
2. Check SSL/TLS mode: Full (strict)
3. Wait 5-10 minutes for propagation

**For Workers:**
1. Verify routes in `wrangler.toml`
2. Check custom domain in Worker settings
3. Ensure DNS CNAME points to worker subdomain

---

## 🔐 Security Checklist

Before going public, verify:

- [ ] No API keys in code
- [ ] No tokens in git history
- [ ] `.gitignore` includes `.env`, `.dev.vars`
- [ ] GitHub Secrets configured
- [ ] Cloudflare Worker secrets set
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] HTTPS enforced
- [ ] Security headers enabled

Check git history:
```bash
# Search for potential leaks
git log --all --full-history --source -- '*secret*' '*key*' '*.env*'

# If found, use git-filter-repo to remove
# See: https://github.com/newren/git-filter-repo
```

---

## 📚 Additional Resources

- **Cloudflare Pages Docs**: https://developers.cloudflare.com/pages
- **Cloudflare Workers Docs**: https://developers.cloudflare.com/workers
- **Wrangler CLI Docs**: https://developers.cloudflare.com/workers/wrangler
- **GitHub Actions Docs**: https://docs.github.com/actions
- **OpenRouter Docs**: https://openrouter.ai/docs
- **AI Chat Feature Docs**: `docs/AI-CHAT.md`

---

## 🆘 Support

If you encounter issues:

1. Check this documentation
2. Review GitHub Actions logs
3. Check Cloudflare Worker logs
4. Test API endpoints with curl
5. Open GitHub issue with:
   - Error message
   - Steps to reproduce
   - Logs (remove sensitive data!)

---

**Last Updated**: 2024-12-10
**Version**: 1.0.0
